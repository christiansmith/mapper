---
title: Reuse and compose mappings
description: Name mappings with $id, reference them with $ref, and inherit pairings with $extend.
sidebar:
  order: 5
---

To reuse a mapping, register it and reference it by name. Registered mappings
carry an `$id` and live in the registry you pass to the constructor:

```js
const mappings = {
  'mapping:Person': {
    $id: 'mapping:Person',
    source: '/',
    mapping: {
      '/name': '/fullName',
      '/email': '/email'
    }
  }
}

const mapper = new Mapper({ mappings }, { initializers: {}, transformers: {}, plugins: {} })
```

Reference it anywhere a descriptor goes. A common shape is `each` with a
`$ref`, one registered mapping applied per element:

```yaml
/team:
  source: /members
  each:
    $ref: 'mapping:Person'
```

```json
{
  "members": [
    { "fullName": "Grace Hopper", "email": "grace@example.com" },
    { "fullName": "Emmy Noether", "email": "emmy@example.com" }
  ]
}
```

becomes:

```json
{
  "team": [
    { "name": "Grace Hopper", "email": "grace@example.com" },
    { "name": "Emmy Noether", "email": "emmy@example.com" }
  ]
}
```

To build one mapping on another, inherit its pairings with `$extend`.
Ancestor pairings run first. A pairing redefined in the child overrides the
ancestor's, in the child's position:

```js
const mappings = {
  'mapping:Person': { /* as above */ },
  'mapping:Employee': {
    $id: 'mapping:Employee',
    $extend: 'mapping:Person',
    source: '/',
    mapping: {
      '/badge': '/badgeId'
    }
  }
}
```

Applying `{ $ref: 'mapping:Employee' }` maps `name`, `email`, and `badge`.
