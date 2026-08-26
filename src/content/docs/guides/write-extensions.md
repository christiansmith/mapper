---
title: Write a transformer, initializer, or plugin
description: The three extension interfaces, their signatures, and when each runs.
sidebar:
  order: 7
---

Extensions are host functions the mapping document calls by name. There are
three kinds. Register them at construction:

```js
const mapper = new Mapper({}, { initializers, transformers, plugins })
```

## Transformer

Synchronous. Reshapes a value mid-pipeline. Called by the `transform`
keyword, by name or as ordered steps:

```js
const transformers = {
  slugify: (value) =>
    typeof value === 'string'
      ? value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-+|-+$)/g, '')
      : value
}
```

```yaml
/slug: { source: /name, transform: slugify }
```

Signature: `(value, context, options?) → value`. An object step passes itself
as `options`.

## Initializer

Synchronous. Runs early, before transforms and validation, and can supply a
value where the input has none. Called by the `init` keyword:

```js
const initializers = {
  placeholder: (value) => (value === undefined ? 'TBD' : value)
}
```

```yaml
/subtitle: { source: /subtitle, init: placeholder }
```

Signature: `(value, context) → value`.

## Plugin

Asynchronous. The only stage where I/O happens. Any descriptor key that names
a registered plugin calls it, with that key's value as options:

```js
const plugins = {
  publishers: async (options, value) => {
    const directory = {
      p1: { name: 'Mapping Press', city: 'Utrecht' },
      p2: { name: 'Pointer House', city: 'Reykjavík' }
    }
    return directory[value]
  }
}
```

```yaml
/publisher: { source: /publisherId, publishers: { pointer: /name } }
```

Signature: `async (options, value, context) → value`. `pointer` in the
options narrows the result. Multiple plugin keys on one descriptor chain in
document order.

## Rules

Initializers and transformers must be synchronous. Plugins are the async
stage. All three receive the shared `context` and can read any scope or
append errors through it. For fetching data from services, see [Fetch remote
data](/mapper/guides/fetch-remote-data/).
