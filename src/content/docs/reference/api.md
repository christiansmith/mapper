---
title: Mapper class API
description: Construction, registries, and the map method.
sidebar:
  order: 5
---

`@christiansmith/mapper-js` exports one class.

```js
import Mapper from '@christiansmith/mapper-js'
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
