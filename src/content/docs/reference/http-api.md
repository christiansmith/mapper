---
title: HTTP API
description: The mapper-http endpoints, request discrimination, and status codes.
sidebar:
  order: 9
---

The [mapper-http](/mapper/guides/serve-over-http/) endpoint surface. Requests
and responses are JSON; every response carries an `X-Request-Id` header.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | no | process liveness (cheap) |
| GET | `/health/mapping` | no | mapping-path health (canary) |
| POST | `/map` | yes* | evaluate a registered or explicit mapping |
| POST | `/validate` | yes* | validate a mapping document or a registered mapping |
| GET | `/mappings` | yes* | list registered mappings |
| GET | `/extensions` | yes* | list installed extension names |

\* when auth is configured.

## POST /map

One request key, `mapping`, discriminated by type:

- **string**: the registered form. Names a registered mapping; an unknown
  id is 404. The mapping's envelope returns as data at 200, `valid: false`
  included; `map.invalidStatus` can promote invalid results to a client
  error.
- **object**: the explicit form. The value is a caller-supplied mapping
  document (a single descriptor or a compound document whose members travel
  together). Off unless `map.explicit` is enabled (403 otherwise), validated
  before evaluation (422 with the full report when invalid), and strictly
  stateless: nothing a caller submits registers into the server.

Any other type, or a missing `mapping`, is 400. `input` carries the input
document.

## POST /validate

The same type discrimination: an object validates a caller-supplied
mapping document against this instance ([instance-level
validation](/mapper/reference/validation/), reachability included) and a
string validates an already-registered mapping. Always 200 with the full
`{ valid, errors, warnings }` report; 4xx is reserved for a malformed
request.

## GET /mappings

The registered mappings, as mapping documents keyed by `$id`. Explicit
submissions never appear here.

## GET /extensions

The installed extension surface, names only, never configuration or code:

```json
{ "initializers": [], "transformers": [], "plugins": ["request"] }
```

## GET /health and GET /health/mapping

`/health` answers `{ "status": "ok" }` when the process serves. Onto
`/health/mapping` the server evaluates a canary mapping through the full
engine (`health.mapping` when configured, else a trivial echo) and
reports 503 when evaluation fails or outruns `health.timeout`. The
container `HEALTHCHECK` targets it.

## Errors

Server errors are `{ "code", "message", "requestId" }` with status 400,
401, 403, 404, 405, 413, 422, 500, or 503. A 422 `InvalidMappingDocument`
carries the full validation report under `report`. Mapping results,
including `valid: false` results, are data at 200, not errors; the
distinction is the same one the engine draws in the [error
model](/mapper/reference/errors/).

The write namespace `POST`/`PUT`/`DELETE /mappings/*` is reserved for
future persistence operations and returns 404 in `0.3`.

The normative contract is the `SPEC.md` in the
[mapper-http repository](https://github.com/christiansmith/mapper-http);
this page describes the published `0.3.1` release.
