---
title: Validate output and apply defaults
description: Add constraint keywords to pairings and fill gaps with default.
sidebar:
  order: 4
---

To validate a value, add constraint keywords to its pairing. To fill a gap,
add `default`:

```yaml
/profile/handle: { source: /handle, required: true, minLength: 3, pattern: '^[a-z0-9-]+$' }
/profile/plan: { source: /plan, default: free }
/profile/seats: { source: /seats, type: number, minimum: 1 }
```

A valid input passes through, with the gap filled:

```json
{ "handle": "ada-1", "seats": 2 }
```

```json
{ "profile": { "handle": "ada-1", "plan": "free", "seats": 2 } }
```

An invalid input fails the whole mapping, and every failed constraint on the
pairing reports. With `"handle": "A!"` the envelope carries both:

```yaml
valid: false
errors:
  - { source: /handle, value: 'A!', minLength: 3, message: cannot be less than 3 characters }
  - { source: /handle, value: 'A!', pattern: '^[a-z0-9-]+$', message: must match pattern }
```

The result is empty. The mapper never returns a partially valid document.

Constraints validate. `default` finalizes: it runs after validation and only
fills `undefined`. `as` coerces the type before validation keywords see the
value.

Constraints check values that exist. A missing value fails nothing except
`required`, so constrain shape freely and add `required: true` where absence
itself is the error.

See [Handle errors](/mapper/guides/handle-errors/) for reading the envelope.
