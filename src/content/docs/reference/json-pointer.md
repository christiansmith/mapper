---
title: JSON Pointer profile
description: RFC 6901 pointers, write semantics, array writes, and relative references.
sidebar:
  order: 2
---

Locations in mappings are [RFC 6901](https://www.rfc-editor.org/rfc/rfc6901)
JSON Pointers, on both sides of a pairing.

## Read form

`/a/b` reads member `b` of member `a`:

```yaml
/v: /a/b
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

The next token decides each container. A non-negative integer or `-` creates
an array, any other token an object:

```yaml
/tags/0: /primary
```

```json
{ "primary": "news" }
```

produces `{ "tags": ["news"] }`. The same write through `/tags/name` would
make `tags` an object.

An index past the end of an array clamps to the end:

```yaml
/list: { constant: [1, 2] }
/list/5: { constant: 3 }
```

produces `{ "list": [1, 2, 3] }`, not a sparse array.

:::caution
Writing into an existing array with a token that is not an index reports no
problem in mapper-js 0.3.2: the write lands at index 0 and shifts the rest.
A diagnostic is planned (SPEC Appendix A, PTR-6).
:::

## Array append

The `-` token appends to an array:

```yaml
/list: { constant: [1, 2] }
/list/-: { constant: 3 }
```

produces `{ "list": [1, 2, 3] }`.

## Invalid pointers

A pointer containing `..` segments is not a pointer. It reports a diagnostic
in every read position:

```yaml
/v: /a/../b
```

```yaml
valid: false
errors:
  - { descriptor: /a/../b, message: pointer must not contain .. segments }
```

To reach a neighbor, use a relative reference.

## Fragment strings

The URI fragment form (`#/a/b`) is not mapping grammar. Pointers stand alone
in mapping documents, never embedded in URIs, so the `#` prefix has no
meaning there; the exclusion is normative as of SPEC §4.2. Evaluation
diagnoses a fragment string as an unrecognized descriptor, and [mapping
validation](/mapper/reference/validation/) reports it:

```yaml
mapping:
  /v: '#/a'
```

```yaml
valid: false
errors:
  - rule: DOC-2
    message: fragment pointers are not valid mapping grammar; use the plain pointer form
    pointer: /mapping/~1v
    descriptor: '#/a'
warnings: []
```

## Relative references

Extended tier. A reference containing `../` resolves against the current
source path and reads from the root input. Each `../` pops one segment.
Inside `each`, this reaches past the element: from element `/items/0`,
`../../currency` pops the index and the array name, then reads `/currency`
from the root:

```yaml
/rows:
  source: /items
  each:
    /label: /label
    /currency: ../../currency
```

```json
{ "currency": "EUR", "items": [{ "label": "a" }, { "label": "b" }] }
```

gives every row the currency.

The normative profile is SPEC §4.
