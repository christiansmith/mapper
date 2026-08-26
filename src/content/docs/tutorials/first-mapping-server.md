---
title: Your first mapping server
description: Run the mapper-http image, serve your own mapping, and check mapping documents against the live server.
sidebar:
  order: 5
---

In this tutorial you'll run a mapping server from the published image, serve
a mapping you wrote, and use the server to check a mapping document before
running it. You'll need [Docker](https://www.docker.com) (or a compatible runtime);
nothing else.

## 1. Run the stock image

```sh
docker run -p 3333:3333 ghcr.io/christiansmith/mapper-http:0.3
```

That's a working mapping server. It ships example mappings so you can map
immediately:

```sh
curl -X POST localhost:3333/map \
  -H 'content-type: application/json' \
  -d '{"mapping":"greet","input":{"message":"hello"}}'
```

```json
{ "text": "hello", "valid": true, "errors": [] }
```

You named a registered mapping (`greet`), sent an input, and got the
mapping's envelope back as data: the same envelope `mapper.map` returns in
[Your first mapping](/mapper/tutorials/first-mapping/), over HTTP.

## 2. Serve your own mapping

Stop the container. Make a directory and save this as `mappings/book.yaml`.
Note the registry form, with an `$id` and the pairings under `mapping:`:

```yaml
$id: book
mapping:
  /book/title: /name
  /book/year: { source: /published, as: number }
```

Mount it and point `MAPPINGS` at it:

```sh
docker run -p 3333:3333 \
  -v ./mappings:/data/mappings \
  -e MAPPINGS=/data/mappings \
  ghcr.io/christiansmith/mapper-http:0.3
```

```sh
curl -X POST localhost:3333/map \
  -H 'content-type: application/json' \
  -d '{"mapping":"book","input":{"name":"The Compleat Mapper","published":"1998"}}'
```

```json
{ "book": { "title": "The Compleat Mapper", "year": 1998 }, "valid": true, "errors": [] }
```

Every mapping document in the directory registers by its `$id`. That's a
deployment: an image, a directory of mapping documents, no code.

## 3. Ask the server what it offers

A mapping author writing against this server wants to know which extensions
exist here:

```sh
curl localhost:3333/extensions
```

```json
{ "initializers": [], "transformers": [], "plugins": ["request"] }
```

## 4. Check a mapping against the live server

`POST /validate` runs the engine's [instance-level
validation](/mapper/reference/validation/), including whether the names a
mapping uses exist on *this* server. Submit a mapping that transforms
with `slugify`:

```sh
curl -X POST localhost:3333/validate \
  -H 'content-type: application/json' \
  -d '{"mapping":{"mapping":{"/slug":{"source":"/title","transform":"slugify"}}}}'
```

```json
{
  "valid": false,
  "errors": [
    {
      "rule": "KW-transform-1",
      "message": "slugify matches no registered transformer",
      "pointer": "/mapping/~1slug/transform",
      "descriptor": "slugify"
    }
  ],
  "warnings": []
}
```

The stock image has no transformers, and the report says exactly that,
without running anything. Validation is always 200. The report is data.

## 5. Run a caller-supplied mapping

Mapping documents in the request body are the *explicit form*, and it's off by
default; try it and you get a 403 refusal. Restart with it enabled:

```sh
docker run -p 3333:3333 \
  -e OPTIONS='{"map":{"explicit":true}}' \
  ghcr.io/christiansmith/mapper-http:0.3
```

```sh
curl -X POST localhost:3333/map \
  -H 'content-type: application/json' \
  -d '{"mapping":{"mapping":{"/text":"/message"}},"input":{"message":"hi"}}'
```

```json
{ "text": "hi", "valid": true, "errors": [] }
```

The mapping was validated, evaluated, and forgotten: explicit submissions
never register into the server.

## Where you are

You've deployed a mapping server, registered your own mapping by mounting a
directory, and used the server to validate and run caller-supplied
mappings. The endpoint surface is on the [HTTP API
reference](/mapper/reference/http-api/); the deployment postures (auth,
claims, and what to enable for whom) are on [HTTP server
configuration](/mapper/reference/http-configuration/) and [Serving
mappings](/mapper/explanation/serving-mappings/).

All exchanges in this tutorial were verified against the published `0.3.1`
server.
