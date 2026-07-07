---
title: Registry keywords
description: $id names a mapping, $ref substitutes one, $extend inherits pairings.
sidebar:
  order: 3
---

Registered mappings live in the registry passed at construction:

```js
const mapper = new Mapper({ mappings }, { initializers: {}, transformers: {}, plugins: {} })
```

## $id

Core. Names a mapping. The registry keys mappings by their `$id`.

## $ref

Core. Substitutes a registered mapping wherever a descriptor goes:

```yaml
$ref: 'mapping:Kv'
```

with the registry entry:

```yaml
'mapping:Kv':
  $id: 'mapping:Kv'
  mapping:
    /key: /k
    /value: /v
```

and input `{ "k": "a", "v": 1 }` produces `{ "key": "a", "value": 1 }`.

## $extend

Core. Inherits a registered mapping's pairings. Ancestors resolve
transitively and their pairings run first. A pairing redefined in the child
overrides the ancestor's, in the child's position.

```yaml
'mapping:Child':
  $id: 'mapping:Child'
  $extend: 'mapping:Parent'
  mapping:
    /b: /b
```

Applying `mapping:Child` maps the parent's pairings and then `/b`.

## description

Core, inert. Documentation only. The evaluator ignores it.

```yaml
/name:
  source: /n
  description: The display name.
```
