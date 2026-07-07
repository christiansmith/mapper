---
title: Error model
description: Accumulation, short-circuit, error-object anatomy, and host exceptions.
sidebar:
  order: 4
---

## Accumulation and short-circuit

Constraints append error objects as they fail. Within a pairing, every failed
constraint reports. After a pairing, any accumulated error short-circuits the
invocation: remaining pairings still in the document do not change the fact
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
