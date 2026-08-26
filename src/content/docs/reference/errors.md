---
title: Error model
description: Evaluation errors vs validation reports, accumulation, short-circuit, and host exceptions.
sidebar:
  order: 4
---

Mapper reports problems through two distinct shapes. **Evaluation errors**
come from running a mapping against an input: they describe values, live in
the result envelope, and empty the result. **Validation reports** come from
checking a mapping document before any input exists: they describe positions
in the mapping document and never involve a result. This page covers evaluation
errors; for the report, see [Mapping
validation](/mapper/reference/validation/).

| | Evaluation error | Validation diagnostic |
|---|---|---|
| Produced by | `mapper.map` | `validate` / `mapper.validate` |
| Describes | a value that failed a constraint | a node of the mapping document |
| Located by | the pointer the pairing read | a pointer into the mapping document |
| Carries | constraint, offending value, message | `rule` id, offending node, message |
| Consequence | `valid: false`, result emptied | `valid: false` in the report; nothing evaluated |

A mapping that validates clean can still produce evaluation errors. No
static check knows what the input will hold.

## Accumulation and short-circuit

Constraints append error objects as they fail. Within a pairing, every failed
constraint reports. After a pairing, any accumulated error short-circuits the
invocation: remaining pairings still in the mapping do not change the fact
that the result is empty. There is no partial output.

```yaml
/book/isbn: { source: /isbn, required: true }
```

with an empty input returns:

```yaml
valid: false
errors:
  - { source: /isbn, required: true, message: required value }
```

## Error-object anatomy

As serialized, an error object carries:

| Field | Meaning |
|---|---|
| `source` | the pointer the pairing read |
| `value` | the offending value, when one was read |
| *constraint* | the failed keyword with its operand, e.g. `minimum: 21` |
| `message` | human-readable summary |

## Extension errors

Extensions report expected failures the same way, by appending to
`context.errors`. An appended error short-circuits like a validation error.

## Host exceptions

A plugin that throws is not a mapping error. The exception escapes
`mapper.map` as a host failure. Wrap the call when a plugin can throw, and
reserve exceptions for genuine faults. See [Handle
errors](/mapper/guides/handle-errors/).
