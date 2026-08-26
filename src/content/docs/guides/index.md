---
title: How-to guides
description: Task-oriented recipes. Each one solves a problem you already have.
sidebar:
  order: 0
---

Recipes for readers who know what they want to do:

- [Restructure fields](/mapper/guides/restructure-fields/): rename, move,
  flatten, and nest with pointer pairings.
- [Map arrays of objects](/mapper/guides/map-arrays/): `each`, element reads,
  and per-field fallbacks.
- [Branch on values](/mapper/guides/branch-on-values/): choose a shape at
  runtime with `switch`.
- [Validate output and apply defaults](/mapper/guides/validate-output/):
  constraint keywords and `default`.
- [Validate a mapping before you run it](/mapper/guides/validate-mappings/):
  check documents, read the report, gate evaluation.
- [Reuse and compose mappings](/mapper/guides/reuse-descriptors/): `$id`,
  `$ref`, and `$extend`.
- [Write a transformer, initializer, or plugin](/mapper/guides/write-extensions/):
  the three extension interfaces.
- [Fetch remote data](/mapper/guides/fetch-remote-data/): the
  params-then-plugin idiom and the request plugin.
- [Handle errors](/mapper/guides/handle-errors/): the envelope, error
  objects, and throwing plugins.
- [Serve mappings over HTTP](/mapper/guides/serve-over-http/): the
  standalone mapper-http image.
- [Validate and submit mappings over HTTP](/mapper/guides/validate-over-http/):
  POST /validate and the explicit form.

Every runnable example is executed against the published engine by the site's
test suite.
