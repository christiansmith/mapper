---
title: JSON Pointer profile
description: RFC 6901 pointers, the fragment form, write semantics, and array appends.
sidebar:
  order: 2
---

Locations in mappings are [RFC 6901](https://www.rfc-editor.org/rfc/rfc6901)
JSON Pointers, on both sides of a pairing.

## Read form

`/a/b` reads member `b` of member `a`. The URI fragment form works too:

```yaml
/v: { source: '#/a/b' }
```

```json
{ "a": { "b": 5 } }
```

writes `5`.

## Write semantics

Writing to a target pointer creates intermediate containers as needed. You
never declare structure:

```yaml
/book/author/name: /author
```

## Array append

The `-` token appends to an array:

```yaml
/list: { constant: [1, 2] }
/list/-: { constant: 3 }
```

produces `{ "list": [1, 2, 3] }`.

## Relative references

Extended tier. A reference like `../sibling` resolves against the current
source path and reads from the root input. Useful inside `each`, where the
element's neighbors are otherwise out of reach.

:::caution
Support in mapper-js 0.1.1 is partial: relative resolution is unreachable for
slash-prefixed pointers (SPEC Appendix A). Treat relative references as
available inside `each` scopes only.
:::

The normative profile is SPEC §4.
