---
title: Map arrays of objects
description: Fan out over arrays with each, read single elements, and fall back across fields.
sidebar:
  order: 2
---

To map every element of an array, scope with `source` and pair inside `each`:

```yaml
/people:
  source: /contributors
  each:
    /name: /fullName
    /role: { source: /role, default: author }
```

```json
{
  "contributors": [
    { "fullName": "Grace Hopper", "role": "editor" },
    { "fullName": "Emmy Noether" }
  ]
}
```

becomes:

```json
{
  "people": [
    { "name": "Grace Hopper", "role": "editor" },
    { "name": "Emmy Noether", "role": "author" }
  ]
}
```

Each element maps against a fresh target. Pointers inside `each` read from
the element.

To read one element, point into it by index:

```yaml
/lead: /contributors/0/fullName
```

To fall back across fields, use an array descriptor. The first defined result
wins, per element:

```yaml
/people:
  source: /contributors
  each:
    /name: ['/nickname', '/fullName']
```
