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

A `$ref` to an id the registry does not hold is a diagnostic naming the id,
not a silent miss.

## $extend

Core. Inherits registered mappings' pairings. The value is a single id or a
list of ids:

```yaml
'mapping:Child':
  $id: 'mapping:Child'
  $extend: 'mapping:Parent'
  mapping:
    /b: /b
```

Applying `mapping:Child` maps the parent's pairings and then `/b`.

With a list, ancestors merge in list order and the extending mapping merges
last:

```yaml
'mapping:Employee':
  $id: 'mapping:Employee'
  $extend: ['mapping:Person', 'mapping:Contact']
  mapping:
    /badge: /badgeId
```

Each layer overrides the ones before it, key by key. A later-listed ancestor
overrides an earlier one, and the extending mapping overrides all:

```yaml
'mapping:A':
  $id: 'mapping:A'
  mapping:
    /v: { constant: from A }
'mapping:B':
  $id: 'mapping:B'
  mapping:
    /v: { constant: from B }
'mapping:C':
  $id: 'mapping:C'
  $extend: ['mapping:A', 'mapping:B']
  mapping: {}
```

Applying `mapping:C` writes `"from B"`. An overridden pairing evaluates in
the overriding layer's position, which matters when later pairings read
earlier writes. Sharing an ancestor between layers needs no care: every
registered mapping is stored flattened, so a shared ancestor's pairings
merge once.

Resolution happens when a mapping is registered, and it consumes `$extend`:
the registry holds the flattened pairing map, which stands alone and can be
serialized or re-registered without its ancestors present. Only the pairing
map is inherited; any other keyword on an ancestor is dropped by the merge.
Naming an ancestor the registry does not hold is an error at registration.

The merge is specified normatively in SPEC §3.5.

## description

Core, inert. Documentation only. The evaluator ignores it.

```yaml
/name:
  source: /n
  description: The display name.
```
