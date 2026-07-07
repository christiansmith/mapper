---
title: Fetch remote data during a mapping
description: Accumulate request parameters with pairings and hand them to an async plugin.
sidebar:
  order: 7
---

Plugins are the mapping's async stage. The idiom for fetching: earlier
pairings build the request parameters, a later pairing hands them to the
plugin, and the plugin's return value replaces them.

```js
const plugins = {
  catalog: async (options, value) => {
    const rows = {
      books: { b1: { title: 'On Mapping', year: 1998 } }
    }
    return rows[value?.type]?.[value?.id]
  }
}
```

```yaml
/params/type: { constant: books }
/params/id: /request/bookId
/book: { output: /params, catalog: {} }
```

```json
{ "request": { "bookId": "b1" } }
```

The first two pairings write the parameters. The third reads them back with
`output`, and the pipeline value, now `{ type: "books", id: "b1" }`, flows
into the plugin:

```json
{
  "params": { "type": "books", "id": "b1" },
  "book": { "title": "On Mapping", "year": 1998 }
}
```

The params stay in the output. Put them where the consumer expects scratch
data, or have the caller read only what it needs.

In production the plugin body is a `fetch`. The mapping stays the same. For
HTTP requests as a packaged plugin, see
[`@christiansmith/mapper-request`](https://jsr.io/@christiansmith/mapper-request).
