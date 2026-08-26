---
title: Mapping validation
description: Check a mapping document's validity as a mapping, before evaluation.
sidebar:
  order: 5
---

Validation checks a mapping document's validity *as a mapping* in one pass,
ahead of evaluation. It answers two questions: is the mapping document
well-formed, and does every name it references resolve? Validation reports; it never
throws, never modifies the mapping or a registry, and never calls an
extension function. The normative treatment is SPEC §10.

## Two positions

```js
import Mapper, { validate } from '@christiansmith/mapper-js'

const report = validate(mapping)         // well-formedness only
const report = mapper.validate(mapping)  // adds referential reachability
```

The named export checks the mapping document's own form: descriptor
grammar, keyword operands, pointer syntax. An instance's `validate` method additionally checks
that every name the mapping references resolves in that instance's
registries: mapping names, `$ref` targets, `$extend` ancestry, initializer
and transformer names, and plugin keys. A report produced without a registry
never contains reachability diagnostics: reachability is undecidable in
isolation (SPEC VAL-3).

When the instance registry is involved, `$extend` ancestry resolves first
and the flattened result, the form evaluation consumes, is what gets
validated. Diagnostics point into what will actually run (SPEC VAL-4).

## The mapping document form

Hand `validate` a descriptor object with its pairings under `mapping:`, the
same shape the registry stores:

```yaml
mapping:
  /name: { source: /user/name, type: string, required: true }
```

:::caution
`mapper.map` accepts a bare pairing map (`{ "/name": … }` without the
`mapping:` wrapper) and wraps it internally. In mapper-js 0.3.2,
`validate` does not: a bare pairing map's pairings are not traversed, so it
reports clean at the document level and draws one warning per pairing at the
instance level. Wrap pairings under `mapping:` before validating. The
specification requires top-level pairings to be traversed (SPEC §10.3), so
expect a future release to close the gap.
:::

## The report

```yaml
valid: true
errors: []
warnings: []
```

`valid` is `true` exactly when `errors` is empty. Warnings never affect
validity (SPEC VAL-6). The report is complete: every violation the traversal
can discover is reported, not only the first (SPEC VAL-8), in document order.
Validation never throws: a mapping document that is not even an object is
*reported* as invalid, not rejected with an exception.

## Diagnostic anatomy

Each entry in `errors` and `warnings` is one object (SPEC VAL-7):

| Field | Meaning |
|---|---|
| `pointer` | JSON Pointer into the mapping document, locating the node |
| `descriptor` | the offending value found there |
| `rule` | the identifier of the violated requirement |
| `message` | human-readable summary |

The pointer escapes `/` in pairing keys as `~1`, per RFC 6901: a problem in
the pairing `/v` under `mapping:` points at `/mapping/~1v`. Validation
diagnostics locate positions in the *mapping document*; evaluation-time
error objects locate values in *evaluation scopes*. The two shapes are
intentionally distinct; see the [error model](/mapper/reference/errors/).

## Well-formedness

A malformed operand is an error whatever registries exist:

```yaml
mapping:
  /year: { source: /published, as: integer }
```

```yaml
valid: false
errors:
  - rule: KW-pipeline-1
    message: as must be string, number, boolean, or json
    pointer: /mapping/~1year/as
    descriptor: integer
warnings: []
```

## Referential reachability

At the instance level, a `transform` naming an unregistered transformer is an
error, the string form included:

```yaml
mapping:
  /slug: { source: /title, transform: sluggify }
```

against an instance whose transformers registry holds `slugify` reports:

```yaml
valid: false
errors:
  - rule: KW-transform-1
    message: sluggify matches no registered transformer
    pointer: /mapping/~1slug/transform
    descriptor: sluggify
warnings: []
```

Fix the name and the same mapping validates clean. The same discipline
covers `init` names, `$ref` and name-string targets, and `$extend` ancestry.

## Warnings

Warnings flag what is legal but suspect. A descriptor key that names neither
a keyword nor an installed extension is inert at evaluation, so instance
validation warns rather than errors:

```yaml
mapping:
  /v: { source: /a, wibble: { k: 1 } }
```

```yaml
valid: true
errors: []
warnings:
  - rule: KW-2
    message: wibble matches no keyword or registered extension
    pointer: /mapping/~1v/wibble
    descriptor: { k: 1 }
```

A top-level pairing that writes `/valid` or `/errors` collides with the
envelope and warns the same way (`CTX-3`).

## Requirement identifiers

Rules come from the specification's check table (SPEC §10.4), grouped by
family: `DOC` (document and descriptor forms), `PTR` (pointer syntax), `REG`
(registry references), `KW` (keyword grammars and reachability), `VAL` (the
operation itself). A diagnostic's `rule` is the stable handle to cite in an
issue or look up in the spec.

For the idiom (validate before you evaluate, in CI or at a service
boundary) see [Validate a mapping](/mapper/guides/validate-mappings/).
