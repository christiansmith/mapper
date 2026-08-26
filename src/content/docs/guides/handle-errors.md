---
title: Handle errors
description: Read the envelope, interpret error objects, and deal with throwing plugins.
sidebar:
  order: 9
---

Every invocation returns the output with two bookkeeping keys merged in:

```js
const { valid, errors, ...result } = await mapper.map(mapping, input)

if (!valid) {
  // result is {}; errors says why
}
```

A failed constraint reports an error object and empties the result:

```yaml
# mapping
/book/isbn: { source: /isbn, required: true }
```

```yaml
# envelope, when /isbn is missing
valid: false
errors:
  - { source: /isbn, required: true, message: required value }
```

Each error object carries the read location (`source`), the constraint that
failed with its operand (`required: true`), and a `message`. There is no
partial output. One error empties the whole result, so consumers never see a
half-valid document.

Extensions report errors the same way, by appending to `context.errors`. A
plugin that *throws* is different: the exception escapes the mapping as a
host error. Wrap the call if a plugin can throw:

```js
try {
  const { valid, errors, ...result } = await mapper.map(mapping, input)
} catch (err) {
  // a plugin threw; this is a host failure, not a mapping error
}
```

Design plugins to append errors for expected failures and reserve exceptions
for genuine faults.
