---
title: Context and envelope
description: The evaluator's working state, the shift rule, and the result envelope.
sidebar:
  order: 3
---

## The context

A context is the evaluator's working state. There is one per nesting level,
and it is just this record:

```yaml
input:   <the input>       # shared: the same object at every level
output:  <the output>      # shared: the top-level target
errors:  []                # shared: one accumulator per invocation
mappings/initializers/transformers/plugins:   # shared registries
source:  <where reads point>        # rebound when evaluation descends
target:  <where writes land>        # rebound: nested mappings get a fresh {}
paths:   { source: /, target: / }   # rebound: each scope's absolute position
```

Descending follows one rule: **share everything, rebind `source`, `target`,
and `paths`.** Watch it on `each` over `/items` with input
`{ "items": [{ "n": 1 }, { "n": 2 }] }`:

| level | `source` | `target` | `paths.source` |
|---|---|---|---|
| top | the input | the output | `/` |
| the pairing | `[{ "n": 1 }, { "n": 2 }]` | the output | `/items` |
| `each` element 0 | `{ "n": 1 }` | fresh `{}` | `/items/0` |

Because `errors` and the roots are shared, a deep validation failure reaches
the envelope, and `output:` reads see everything written so far.

## The envelope

An invocation returns the output with two bookkeeping keys merged in:

```js
const { valid, errors, ...result } = await mapper.map(mapping, input)
```

`valid` is `true` with an empty `errors` array on success. Any error makes
`valid` false, fills `errors`, and empties the result. See [Error
model](/mapper/reference/errors/).

Name output keys to avoid colliding with `valid` and `errors`.
