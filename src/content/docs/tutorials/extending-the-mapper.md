---
title: Extending the mapper
description: Register your own transformers and async plugins, and call them from a mapping document.
sidebar:
  order: 3
---

Mapping documents describe *what* goes where. Some values need computing: a
slug, a lookup, a fetch. For those, the document names a function and your
host code supplies it. In this tutorial you'll register a transformer
(synchronous) and a plugin (asynchronous), and call both from a mapping.

Keep the project from the previous tutorials.

## 1. Write a transformer

A transformer is a synchronous function `(value, context, options?) → value`.
In `main.js`, define one and hand it to the constructor:

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

const mapper = new Mapper({}, { initializers: {}, transformers, plugins: {} })
```

Call it by name from `mapping.yaml`:

```yaml
/book/title: /name
/book/slug: { source: /name, transform: slugify }
```

With `input.json` as `{ "name": "On Mapping" }`, running `main.js` gives:

```json
{
  "book": {
    "title": "On Mapping",
    "slug": "on-mapping"
  }
}
```

`transform` also takes an ordered list of steps, each a name or an object
carrying options. The steps chain, each feeding the next.

## 2. Write a plugin

Plugins are the mapper's only asynchronous stage. All I/O enters here. A
plugin is `async (options, value, context) → value`, and any descriptor key
that names one calls it. Register a publisher directory:

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

const mapper = new Mapper({}, { initializers: {}, transformers, plugins })
```

In real code the body might `fetch`. The mapping stays the same either way.

Use it from `mapping.yaml`:

```yaml
/book/publisher: { source: /publisherId, publishers: {} }
```

With `input.json` as `{ "name": "On Mapping", "publisherId": "p1" }`, the
pipeline value, the publisher id, flows into the plugin. The plugin's return
value replaces it:

```json
{
  "book": { "publisher": { "name": "Mapping Press", "city": "Utrecht" } }
}
```

## 3. Narrow a plugin result

You rarely want a whole record. `pointer` in the plugin's options narrows its
result:

```yaml
/book/publisherName: { source: /publisherId, publishers: { pointer: /name } }
```

Now the pairing writes just `"Mapping Press"`. Several plugin keys on one
descriptor chain in document order, each replacing the value the last one
produced. You compose the pipeline from the mapping document.

## Where you are

Your functions now run inside the mapping: synchronous shaping via
`transform`, asynchronous lookups via plugins. The document decides what gets
called where. That covers the extension surface of the happy path. The
[Reference](/mapper/reference/) covers the rest, including how extensions
read scopes and report errors.
