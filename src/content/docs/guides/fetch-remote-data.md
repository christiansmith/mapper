---
title: Fetch remote data during a mapping
description: Accumulate request parameters with pairings and hand them to an async plugin.
sidebar:
  order: 8
---

Plugins are the mapping's async stage. The idiom for fetching: earlier
pairings build the request parameters, a later pairing hands them to the
plugin, and the plugin's return value replaces them.

```js
const plugins = {
  catalog: async (options, value) => {
    const rows = {
      books: { b1: { title: 'On Mapping', year: 1998 } }
    }
    return rows[value?.type]?.[value?.id]
  }
}
```

```yaml
/params/type: { constant: books }
/params/id: /request/bookId
/book: { output: /params, catalog: {} }
```

```json
{ "request": { "bookId": "b1" } }
```

The first two pairings write the parameters. The third reads them back with
`output`, and the pipeline value, now `{ type: "books", id: "b1" }`, flows
into the plugin:

```json
{
  "params": { "type": "books", "id": "b1" },
  "book": { "title": "On Mapping", "year": 1998 }
}
```

The params stay in the output. Put them where the consumer expects scratch
data, or have the caller read only what it needs.

In production the plugin body is a `fetch`, and the packaged version of it
is [`@christiansmith/mapper-request`](https://jsr.io/@christiansmith/mapper-request).
The rest of this guide uses it.

## Use the packaged request plugin

Build the plugin with `createRequest` and register it. Policy (timeouts,
header forwarding, destination checks, response size) is fixed here, at
construction, and never comes from the mapping:

```js
import Mapper from '@christiansmith/mapper-js'
import mapperRequest from '@christiansmith/mapper-request'

const request = mapperRequest.createRequest({})
const mapper = new Mapper({}, { plugins: { request } })
```

`mapperRequest.request` is the same plugin with every default, ready-made.
The defaults are safe: a 10-second timeout covering the response body, and
refusal of every redirect.

A mapping fetches by building the request in earlier pairings and handing it
to the plugin: the same idiom as above, with `request` in the catalog
plugin's seat:

```yaml
/params/id: /request/bookId
/book:
  output: /params
  request:
    origin: https://api.example.test
    pathname: /books/{{id}}
    pointer: /json
```

```json
{ "request": { "bookId": "b1" } }
```

produces:

```json
{
  "params": { "id": "b1" },
  "book": { "title": "On Mapping", "year": 1998 }
}
```

`pathname` substitutes `{{id}}` from the pipeline value, URL-encoded. The
plugin returns a parse envelope (content type, the parsed body under
`/json`, cache stamps), so `pointer: /json` narrows the result to the
payload. The full descriptor and configuration surface is on the [request
plugin reference](/mapper/reference/request-plugin/).

## Fetch a URL that arrives as data

When the URL itself is input data, a feed entry pointing at its full
record say, locate it and hand it to the plugin with the scoped `url` form:

```yaml
/feed:
  source: /feedUrl
  request:
    url: { source: '' }
    pointer: /json
```

```json
{ "feedUrl": "https://api.example.test/feed" }
```

produces:

```json
{ "feed": { "items": [1, 2] } }
```

`url` names exactly one scope (`source`, `target`, `input`, or `output`)
and reads the URL from it verbatim (the empty pointer reads the whole
pipeline value). A bare pointer string still reads from the output,
unchanged. See [Where values come
from](/mapper/explanation/evaluation-scopes/) for what each scope means.

## Hold a destination boundary

A deployment that fetches URLs arriving as data decides *where* requests may
go, in configuration, not in mappings. `checkUrl` runs before any
connection:

```js
const request = mapperRequest.createRequest({
  checkUrl: (url) => {
    const { hostname } = new URL(url)
    if (
      hostname === 'localhost' ||
      /^(127\.|10\.|192\.168\.|169\.254\.)/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    ) {
      throw new Error(`Refused destination: ${url}`)
    }
  }
})
```

With that policy, a mapping steered at an internal address fails with the
refusal instead of fetching. Redirects are refused by default, because the
upstream chooses the redirect target and following one blindly would defeat
exactly this boundary:

```yaml
/v: { source: /u, request: { url: { source: '' } } }
```

with `/u` pointing at a redirecting endpoint rejects with `Redirect refused:
https://api.example.test/moved responded 302 to /elsewhere`.

A deployment can opt in to bounded following (`redirect: 'follow'`) without
giving that boundary up: following is GET-only, capped at `maxRedirects`
hops, restricted to same-origin targets (plus the http→https upgrade of the
same host), and **every redirect target re-passes `checkUrl` before it is
fetched** — so the destination policy above holds across a chain exactly as
it holds for the URL the mapping submitted. The full option surface is on
the [request plugin reference](/mapper/reference/request-plugin/).

A `checkUrl` string check is the cheap gate; network egress rules are the
robust wall. The rationale is on [Policy at
construction](/mapper/explanation/policy-at-construction/).
