---
title: Reference
description: Precise descriptions of every keyword, descriptor form, the context, the error model, and the API.
sidebar:
  order: 0
---

Precise descriptions of Mapper's surface. These pages describe; the
[specification](https://github.com/christiansmith/mapper-js/blob/main/SPEC.md)
prescribes.

- [Descriptor forms](/mapper/reference/descriptor-forms/): the five shapes a
  descriptor takes.
- [Keyword catalog](/mapper/reference/keywords/): every keyword by pipeline
  stage, with tier and a tested example.
- [JSON Pointer profile](/mapper/reference/json-pointer/): pointers, write
  semantics, array writes, relative references.
- [Context and envelope](/mapper/reference/context/): the evaluator's working
  state, the scopes, and the result shape.
- [Error model](/mapper/reference/errors/): evaluation errors vs validation
  reports, accumulation, short-circuit.
- [Mapping validation](/mapper/reference/validation/): the validate
  operation, the report, and diagnostic anatomy.
- [Mapper class API](/mapper/reference/api/): construction, `map`, and
  `validate`.
- [Request plugin](/mapper/reference/request-plugin/): mapper-request
  configuration, descriptor surface, and the parse envelope.
- [HTTP API](/mapper/reference/http-api/): the mapper-http endpoints and
  status codes.
- [HTTP server configuration](/mapper/reference/http-configuration/): the
  mapper-http environment, mapping sources, and options.
- [Conformance](/mapper/reference/conformance/): tiers, the spec, and the
  test suites.

Every runnable example is executed against the published engine by the site's
test suite.
