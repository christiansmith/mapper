---
title: HTTP server configuration
description: The mapper-http environment, mapping sources, and the options object.
sidebar:
  order: 10
---

A [mapper-http](/mapper/guides/serve-over-http/) deployment is configured by
a small bootstrap environment plus one options object.

## Environment

| Variable | Meaning | Default |
|---|---|---|
| `PORT` | listen port | `3333` |
| `MAPPINGS` | mapping source: module path, document file, or directory | bundled examples |
| `EXTENSIONS` | module path exporting extensions | bundled surface |
| `OPTIONS` | the full options object as JSON | `{}` |
| `OPTIONS_FILE` | path to a file holding the options object (`.json`, `.yaml`, `.yml`) | unset |

`PORT`/`MAPPINGS`/`EXTENSIONS` are bootstrap; `OPTIONS` (or `OPTIONS_FILE`)
is the canonical channel for everything else. There are no per-option
environment variables. Setting both `OPTIONS` and `OPTIONS_FILE`, or
supplying a value that does not parse, fails startup loudly.

## Mapping sources

`MAPPINGS` is discriminated by what the path is: a **module** (`.js`/`.ts`)
whose default export is the mappings descriptor; a **document file** holding
one mapping document; or a **directory**, scanned recursively in
lexicographic path order, every mapping registered by its `$id`. The same
`$id` from two files is a startup error naming both files.

## Extensions

`EXTENSIONS` is always a module path, because extensions are code. Its default
export is `{ initializers, transformers, plugins }`, the surface mapping
authors call by name (the signatures are the engine's; see [Write
extensions](/mapper/guides/write-extensions/)). Setting `EXTENSIONS`
**replaces** the bundled surface, the stock [request
plugin](/mapper/reference/request-plugin/) included; re-export it to keep
it:

```js
import mapperRequest from '@christiansmith/mapper-request'

export default {
  transformers: { shout: (value) => String(value).toUpperCase() },
  plugins: { request: mapperRequest.createRequest({ allowHeaders: [] }) }
}
```

## Options

| Option | Meaning |
|---|---|
| `auth` | bearer-token auth: one key strategy (`secret` HS256, `publicKey` SPKI PEM, or `jwksUri`) plus `algorithm` allowlist, `issuer`, `audience`, `clockSkew`. Omit to disable |
| `cors` | `{ origin, methods, headers }`. Omit to disable. Bearer-only; credentials are not enabled |
| `logging` | `{ format: 'json' \| 'pretty', level, slowThreshold }`; `Authorization` is always redacted |
| `errorDetail` | `'minimal'` (default) hides 5xx detail from clients; `'full'` returns it |
| `maxBodyBytes` | reject larger request bodies with 413 (default 1 MiB) |
| `requestIdPrefix` | prefix for generated request ids (default `req_`) |
| `map` | `{ invalidStatus?, claims?, explicit? }`. `claims` gates `POST /map`; `explicit` enables the explicit form (`true`, or `{ claims }` to gate it separately) |
| `validate` | `{ claims? }` gates `POST /validate` |
| `health` | `{ mapping?, timeout? }`: the canary for `GET /health/mapping` (default timeout 5000 ms) |

Per-capability claims compose into deployment postures: registered mappings
only (explicit off), explicit for named callers (claims on the explicit
form), or validate-but-never-evaluate (validation granted, explicit off);
see [Serving mappings](/mapper/explanation/serving-mappings/).

## The image

`ghcr.io/christiansmith/mapper-http` tags track releases (`0.3`, `0.3.1`,
`latest`). The container runs as `USER deno`, and its `HEALTHCHECK` targets
`GET /health/mapping`. The stock surface builds the request plugin with an
empty header allowlist, so no caller-supplied request header is forwarded
upstream.

This page describes the published `0.3.1` release; the normative contract
is the `SPEC.md` in the
[mapper-http repository](https://github.com/christiansmith/mapper-http).
