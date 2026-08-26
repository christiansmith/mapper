---
title: Mapper class API
description: Construction, registries, the map method, and the validate operation.
sidebar:
  order: 6
---

`@christiansmith/mapper-js` exports the `Mapper` class as its default and the
`validate` function by name.

```js
import Mapper, { validate } from '@christiansmith/mapper-js'
```

## Constructor

```js
const mapper = new Mapper(
  { mappings },
  { initializers, transformers, plugins }
)
```

The first argument carries the mapping registry: an object whose `mappings`
key maps `$id` strings to mapping documents, for `$ref` and `$extend`
resolution. `$extend` resolves as each mapping registers, and resolution
consumes the keyword: the registry stores the flattened mapping, which
stands alone if serialized or re-registered. The second argument carries the
three extension registries. Pass empty objects for anything unused.

## map

```js
const { valid, errors, ...result } = await mapper.map(mapping, input)
```

Applies a mapping document to an input document and resolves to the envelope:
the output with `valid` and `errors` merged in. `map` is asynchronous because
plugins are; a mapping with no plugins still returns a promise.

Mapping documents are ordered maps. Parse them with a parser that preserves
key order (standard YAML and JSON parsers do).

```js
const mapping = parse(await Deno.readTextFile('mapping.yaml'))
```

For descriptor grammar, start at [Descriptor
forms](/mapper/reference/descriptor-forms/) and the [keyword
catalog](/mapper/reference/keywords/).

## validate

```js
const report = validate(mapping) // well-formedness
const report = mapper.validate(mapping) // adds reachability
```

Both return the report `{ valid, errors, warnings }` synchronously and never
throw. The named export checks the mapping document's own form; the method also
checks every referenced name against the instance's registries. Hand either
one a descriptor object with pairings under `mapping:`; unlike `map`,
`validate` does not wrap a bare pairing map. Details, diagnostic anatomy, and
the wrapped-form caution: [Mapping
validation](/mapper/reference/validation/).
