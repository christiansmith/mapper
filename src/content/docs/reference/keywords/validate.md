---
title: Validation keywords
description: Constraint keywords accumulate error objects; the value passes through.
sidebar:
  order: 6
---

Validation keywords check the pipeline value. They never replace it. A failed
constraint appends an error object to the envelope, and any error empties the
final result. Every failed constraint on a pairing reports, so one bad value
can carry several errors.

| Keyword | Operand | Fails when |
|---|---|---|
| `type` | `string` `number` `boolean` … | the value's type differs |
| `minimum` / `maximum` | number | the value is below / above |
| `multipleOf` | number | the value isn't a multiple |
| `minLength` / `maxLength` | number | the length is below / above |
| `enum` | array | the value isn't a member |
| `pattern` | regex source string | the string doesn't match |
| `required` | `true` | the value is `undefined` |

A passing constraint is silent:

```yaml
/age: { source: /age, type: number, minimum: 0 }
```

```json
{ "age": 41 }
```

writes `41` with no errors. A failing one reports:

```yaml
/age: { source: /age, minimum: 21 }
```

```json
{ "age": 16 }
```

```yaml
valid: false
errors:
  - { source: /age, value: 16, minimum: 21, message: cannot be less than 21 }
```

Error objects carry the read location, the offending value, the constraint
with its operand, and a message. See [Handle
errors](/mapper/guides/handle-errors/).

Constraints check values that exist. On an absent value they are silent, and
only `required` reports the absence:

```yaml
/v: { source: /missing, minLength: 3 }
```

with an empty input writes nothing and reports nothing. Each constraint also
checks only values of its own type: `minLength` ignores a number, `minimum`
ignores a string.
