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

## What a scoped pointer reads

Four scope names recur across the language: on locate keywords, inside
`switch`, and in extension options such as the request plugin's `url`. A
pointer read against a scope always means the same thing:

| Scope | Reads from |
|---|---|
| `source` | the pipeline value: the context's source as refined by the descriptor's own locate, dispatch, and any earlier plugin in the chain |
| `target` | the object under construction at the current level |
| `input` | the root input, shared at every level |
| `output` | the root output written so far, shared at every level |

`source` is the moving part. At the top it is the whole input; a descriptor's
`source:` narrows it; under `each` it is the current element; after a plugin
it is that plugin's result. `target` moves too (nested mappings build into a
fresh target per level), while `input` and `output` always name the roots:

```yaml
/currency: /currency
/rows:
  source: /items
  each:
    /n: /n
    /currency: { output: /currency }
    /copy: { target: /n }
```

```json
{ "currency": "EUR", "items": [{ "n": 1 }, { "n": 2 }] }
```

produces:

```json
{
  "currency": "EUR",
  "rows": [
    { "n": 1, "currency": "EUR", "copy": 1 },
    { "n": 2, "currency": "EUR", "copy": 2 }
  ]
}
```

Inside each element, `/n` reads the element (the pipeline value), `output:
/currency` reads what the first pairing already wrote at the root, and
`target: /n` reads the element's own object under construction. An `output:`
read sees only completed pairings: the `/rows` array is still being built, so
`/rows/0/n` would read nothing from inside it. For why the scopes work this
way, see [Where values come from](/mapper/explanation/evaluation-scopes/).

## The envelope

An invocation returns the output with two bookkeeping keys merged in:

```js
const { valid, errors, ...result } = await mapper.map(mapping, input)
```

`valid` is `true` with an empty `errors` array on success. Any error makes
`valid` false, fills `errors`, and empties the result. See [Error
model](/mapper/reference/errors/).

Name output keys to avoid colliding with `valid` and `errors`.
