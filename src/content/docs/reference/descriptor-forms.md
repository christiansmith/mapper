---
title: Descriptor forms
description: The five shapes a descriptor can take.
sidebar:
  order: 1
---

A descriptor is the right-hand side of a pairing. It takes one of five forms.

| Form | Example | Meaning |
|---|---|---|
| Pointer string | `"/a/b"` | read from the current source |
| Relative reference | `"../sibling"` | resolve against the source path (Extended) |
| Name string | `"mapping:Person"` | reference a registered mapping |
| Object | `{ "source": "/a", "as": "number" }` | keyword descriptor |
| Array | `["/a", "/b"]` | alternatives; first defined result wins |

A pointer string is the common case:

```yaml
/title: /book/title
```

An object composes keywords into a pipeline:

```yaml
/year: { source: /book/published, as: number }
```

An array tries alternatives per evaluation:

```yaml
/name: ['/nickname', '/fullName']
```

Relative references belong to the Extended tier and resolve against the
current source path; see the
[JSON Pointer profile](/mapper/reference/json-pointer/).

Name strings and `$ref` both reference the registry; see [Registry
keywords](/mapper/reference/keywords/registry/).

A string that is none of these forms is an error, not a read:

```yaml
/v: not a pointer
```

```yaml
valid: false
errors:
  - { descriptor: not a pointer, message: unrecognized string descriptor }
```

The diagnostic names the string, so a typo fails loudly instead of quietly
mapping the wrong thing.
