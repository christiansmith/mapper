---
title: Structure keywords
description: mapping and each nest evaluation with a fresh target.
sidebar:
  order: 2
---

Structure keywords hold pairings. They descend: descendant pairings evaluate
against a fresh target, and the finished result writes back at the pairing's
target pointer.

## mapping

Core. An ordered map of pairings. Order is semantics: pairings run
sequentially, and later pairings can read earlier writes.

```yaml
/person/name: /n
```

is shorthand for a top-level `mapping`. Nested, it builds structure:

```yaml
/out:
  source: /data
  mapping:
    /name: /n
```

## each

Core. The same as `mapping`, applied over an array: one fresh target per
element, elements evaluated in parallel. Pointers inside `each` read from the
element.

```yaml
/out:
  source: /items
  each:
    /v: /n
```

```json
{ "items": [{ "n": 1 }, { "n": 2 }] }
```

produces `{ "out": [{ "v": 1 }, { "v": 2 }] }`.

Pairing order is still meaningful inside each element. Cross-element order is
not: elements map independently.
