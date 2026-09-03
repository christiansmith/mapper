---
title: Serve mappings over HTTP
description: Run mappings behind an HTTP endpoint with the standalone mapper-http image.
sidebar:
  order: 10
---

[`@christiansmith/mapper-http`](https://github.com/christiansmith/mapper-http)
exposes a Mapper instance over HTTP: the deployment supplies mappings and
extensions, clients send input documents, the service returns mapped output.
The published image runs standalone: a bare `docker run` is a working
mapping server.

## Start a server

```sh
docker run -p 3333:3333 ghcr.io/christiansmith/mapper-http:0.3
```

The stock image serves bundled example mappings and the stock extension
surface (the [request plugin](/mapper/reference/request-plugin/) with an
empty header allowlist). Map with a registered mapping's id:

```sh
curl -X POST localhost:3333/map \
  -H 'content-type: application/json' \
  -d '{"mapping":"greet","input":{"message":"hello"}}'
```

```json
{ "text": "hello", "valid": true, "errors": [] }
```

The response is the mapping's envelope, as data, at 200, `valid: false`
results included. An unknown id is a 404.

## Bring your own mappings

Mount a directory and point `MAPPINGS` at it, no image build:

```sh
docker run -p 3333:3333 \
  -v ./mappings:/data/mappings \
  -e MAPPINGS=/data/mappings \
  ghcr.io/christiansmith/mapper-http:0.3
```

`MAPPINGS` takes a directory (scanned recursively; every mapping registers
by its `$id`, and a duplicate `$id` across files is a startup error), a
single document file (`.json`, `.yaml`, `.yml`), or a module path whose
default export is the mappings descriptor. Mapping documents are the
[registry form](/mapper/reference/keywords/registry/): an object carrying
`$id` and its pairings under `mapping:`.

For a deployment artifact, layer the same assets onto the stock base:

```dockerfile
FROM ghcr.io/christiansmith/mapper-http:0.3
COPY --chown=deno:deno mappings/ /data/mappings/
ENV MAPPINGS=/data/mappings
```

## Configure the deployment

`OPTIONS` (inline JSON) or `OPTIONS_FILE` (a JSON or YAML file) carries the
options object: auth, CORS, logging, body limits, and the per-endpoint
gates. The environment is bootstrap only; there are no per-option
variables. See the [configuration
reference](/mapper/reference/http-configuration/).

```sh
docker run -p 3333:3333 \
  -e OPTIONS='{"map":{"invalidStatus":422}}' \
  ghcr.io/christiansmith/mapper-http:0.3
```

## Operate it

`GET /health` is cheap process liveness. `GET /health/mapping` runs a canary
mapping through the full engine and reports 503 when evaluation fails or
outruns its timeout. The container `HEALTHCHECK` targets it, so an image
whose engine cannot evaluate reports unhealthy, not just up.

`GET /extensions` lists the installed extension surface by name:

```sh
curl localhost:3333/extensions
```

```json
{ "initializers": [], "transformers": [], "plugins": ["request"] }
```

That list is what mapping authors write against, and what
[instance-level validation](/mapper/guides/validate-over-http/) checks
their documents against.

All exchanges on this page were verified against the published `0.3.2`
server. For callers submitting their own mapping documents (the explicit
form and the validation endpoint) continue with [Validate and submit
mappings over HTTP](/mapper/guides/validate-over-http/).
