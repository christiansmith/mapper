---
title: Request plugin
description: The mapper-request plugin's configuration policy, descriptor surface, and parse envelope.
sidebar:
  order: 8
---

[`@christiansmith/mapper-request`](https://jsr.io/@christiansmith/mapper-request)
packages HTTP fetching as a Mapper plugin. The deployment constructs it with
policy; mappings describe requests; the plugin fetches, parses, and returns
an envelope the mapping narrows.

```js
import mapperRequest from '@christiansmith/mapper-request'

const request = mapperRequest.createRequest(config)
```

`mapperRequest.request` is the safe-defaults instance of the same factory.

## Configuration

Policy is fixed at construction and never read from the mapping: mappings
may be authored by callers; configuration only by the deployment.

| Option | Meaning | Default |
|---|---|---|
| `timeoutMs` | abort the request after this many ms; covers the response body as well as the headers | `10000` |
| `redirect` | `'refuse'` rejects every redirect response; `'follow'` enables bounded following (below) | `'refuse'` |
| `maxRedirects` | under `'follow'`, the hop bound: an integer from 0 to 20 | `2` |
| `redirectHttpsUpgrade` | under `'follow'`, also allow the http→https upgrade of the identical hostname on default ports | `true` |
| `allowHeaders` | descriptor-header forwarding: `true` forwards all, a list forwards only the named headers (case-insensitive) | `true` |
| `checkUrl` | called with the resolved URL before any connection; throw to refuse | none |
| `maxResponseBytes` | reject response bodies over this size, during the stream read | none |

Redirect responses (301, 302, 303, 307, 308) are refused by default, with
the target named in the error. The refusal is typed: the error carries
`code: 'E_REDIRECT_REFUSED'`, the response `status`, and the `location`
target, so a host can classify it without parsing the message. A refused
request, a timeout, and an oversize response all throw: they are host
failures, not mapping errors (see the [error
model](/mapper/reference/errors/)).

### Following redirects

`redirect: 'follow'` is a deployment decision, and following is deliberately
narrow: GET requests only, at most `maxRedirects` hops, and targets
restricted to the same origin — plus, under `redirectHttpsUpgrade`, the
http→https upgrade of the identical hostname on default ports (the
downgrade direction never follows). Every redirect target re-passes
`checkUrl` before it is fetched, so destination policy holds across a chain
exactly as it holds for a directly submitted URL. Anything outside those
bounds refuses with the same typed error. The policy values are validated
at construction: a `maxRedirects` that is not an integer in range, or a
non-boolean `redirectHttpsUpgrade`, fails loudly instead of weakening the
bound. (Following requires the static `URL.parse` — Deno ≥ 1.43,
Node ≥ 22.1.)

## Descriptor surface

The plugin key's value describes one request:

| Key | Meaning |
|---|---|
| `origin` | scheme and host, concatenated as given |
| `pathname` | path template; `{{param}}` substitutes from the pipeline value, URL-encoded |
| `search` | query map; each value substitutes from the pipeline value by name, else stands as a literal |
| `url` | the whole URL instead of `origin`/`pathname`/`search`: a pointer string reads from the output; a scoped object names exactly one of `source`, `target`, `input`, `output` |
| `method` | HTTP method (default `GET`) |
| `headers` | request headers, subject to `allowHeaders` |
| `body` | a mapping document (pairings under `mapping:`); its result is sent as the JSON request body |
| `pointer` | narrows the plugin's result, like any plugin option |

`url` resolves verbatim from its scope, with no templating and no encoding,
which is what makes `checkUrl` the boundary for deployments that fetch URLs
arriving as data. The scopes are the language's usual four; see [Where
values come from](/mapper/explanation/evaluation-scopes/).

## The parse envelope

The plugin parses by content type and returns an envelope, not the raw
payload: `content-type`, the parsed body under `json` (JSON and XML), the
raw text under `xml` or `html`, extracted linked data and meta tags for
HTML, and cache stamps. Mappings narrow to what they need with `pointer`;
`pointer: /json` for the payload is the common case. The cache stamps change
per fetch, so a mapping that writes the whole envelope is nondeterministic
by construction; narrow.

## Examples

A query built from the pipeline value:

```yaml
/params/term: /q
/results:
  output: /params
  request:
    origin: https://api.example.test
    pathname: /things
    search: { q: term }
    pointer: /json/results
```

```json
{ "q": "maps" }
```

fetches `/things?q=maps` and writes what the endpoint returned under
`results`.

A POST whose body is itself a mapping:

```yaml
/created:
  request:
    origin: https://api.example.test
    pathname: /things
    method: POST
    body:
      mapping:
        /name: /draft/title
    pointer: /json/body
```

```json
{ "draft": { "title": "Ada" } }
```

sends `{ "name": "Ada" }` as the JSON body and writes:

```json
{ "name": "Ada", "created": { "name": "Ada" } }
```

The body mapping reads from the root input, and, like `template`'s
companion [mapping](/mapper/reference/keywords/shape/), its pairings also
write at their own targets in the output (`/name` above). Point them where
scratch data can live.

Header policy in action: the deployment forwards nothing
(`allowHeaders: []`, the posture the mapper-http stock image ships), so a
descriptor-authored header never reaches the wire:

```yaml
/reflected:
  request:
    origin: https://api.example.test
    pathname: /echo
    headers: { x-api-key: k123 }
    pointer: /json/headers/x-api-key
```

writes nothing under that configuration, and `"k123"` under
`allowHeaders: true`.

Bounded following in action: many hosts canonicalize URLs with a redirect,
most commonly to a trailing-slash form. Under the default policy that fetch
refuses; a deployment built with `redirect: 'follow'` resolves it:

```yaml
/article:
  request:
    origin: https://api.example.test
    pathname: /article
    pointer: /json
```

against an endpoint that redirects `/article` to `/article/` writes what the
canonical URL returns:

```json
{ "article": { "title": "On Mapping" } }
```

The same mapping under `redirect: 'refuse'` (the default) rejects with
`Redirect refused: https://api.example.test/article responded 302 to
/article/`.

Size and time bounds reject rather than degrade: an oversize body rejects
with `Response exceeds <n> bytes`, a stalled upstream with `Request timed
out after <n> ms`.

For the fetching idioms (parameter accumulation, URLs as data, destination
policy) see [Fetch remote data](/mapper/guides/fetch-remote-data/).
