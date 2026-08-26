---
title: Validate and submit mappings over HTTP
description: Use POST /validate and the explicit mapping form to work with caller-supplied mapping documents.
sidebar:
  order: 11
---

A running [mapper-http](/mapper/guides/serve-over-http/) instance can check
and evaluate mapping documents its callers supply, with validation always
available as the safe half, and evaluation of caller mappings off unless
the deployment turns it on.

## Validate a mapping against the instance

`POST /validate` runs [instance-level
validation](/mapper/reference/validation/): well-formedness plus
reachability against what this server actually has installed.

```sh
curl -X POST localhost:3333/validate \
  -H 'content-type: application/json' \
  -d '{"mapping":{"mapping":{"/slug":{"source":"/title","transform":"slugify"}}}}'
```

Against the stock image, which installs no transformers, the report says so:

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

The response is always 200 with the full report: a validation report is
data, not an error; 4xx is reserved for the request itself being malformed.
A string instead of a mapping document validates an already-registered
mapping the same way. Check what an instance offers before authoring against it with
`GET /extensions`.

## Submit a mapping explicitly

`POST /map` discriminates on the type of `mapping`: a string names a
registered mapping; an object is a caller-supplied mapping document, the
**explicit form**:

```sh
curl -X POST localhost:3333/map \
  -H 'content-type: application/json' \
  -d '{"mapping":{"mapping":{"/text":"/message"}},"input":{"message":"hi"}}'
```

```json
{ "text": "hi", "valid": true, "errors": [] }
```

The explicit form is off by default:

```json
{ "code": "Forbidden", "message": "The explicit mapping form is not enabled on this deployment", "requestId": "req_6c4b1ed06e88" }
```

Enable it with `map.explicit`, and gate it separately from registered
mapping runs with `map.explicit.claims` (see the [configuration
reference](/mapper/reference/http-configuration/)):

```sh
docker run -p 3333:3333 \
  -e OPTIONS='{"map":{"explicit":true}}' \
  ghcr.io/christiansmith/mapper-http:0.3
```

## Invalid mappings never evaluate

A submitted mapping document is validated before evaluation; an invalid
one returns 422 carrying the full report:

```json
{
  "code": "InvalidMappingDocument",
  "message": "The submitted mapping document is invalid",
  "report": {
    "valid": false,
    "errors": [
      {
        "rule": "KW-pipeline-1",
        "message": "as must be string, number, boolean, or json",
        "pointer": "/mapping/~1v/as",
        "descriptor": "integer"
      }
    ],
    "warnings": []
  },
  "requestId": "req_f8b8c9a32947"
}
```

The gate also rejects catastrophic regexes before they reach evaluation, via
the engine's [pattern safety screen](/mapper/reference/keywords/validate/).

Explicit evaluation is strictly stateless: references resolve against the
submitted mapping first, then the installed registry, and nothing a caller
submits registers into the server or is observable to any other request.
Why the endpoint is shaped this way, and what the validate-but-never-map
posture is for, is on [Serving
mappings](/mapper/explanation/serving-mappings/).

All exchanges on this page were verified against the published `0.3.1`
server.
