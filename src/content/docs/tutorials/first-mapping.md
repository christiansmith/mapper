---
title: Your first mapping
description: Install mapper-js, write a mapping document, and transform your first record.
sidebar:
  order: 1
---

In this tutorial you'll turn a legacy book record into a clean catalog entry
without writing transformation code. You'll describe the result you want in a
mapping document, apply it, and let the mapping validate its own output.

You'll need [Deno](https://deno.com) 2 installed. Everything else arrives in
step 1.

## 1. Create a project

```sh
mkdir first-mapping && cd first-mapping
deno add jsr:@christiansmith/mapper-js jsr:@std/yaml
```

## 2. Describe the shape you want

A mapping is a document. Each line pairs a **target** location, where to
write in the output, with a descriptor of what to read. Save this as
`mapping.yaml`:

```yaml
/book/title: /name
/book/year: { source: /published, as: number }
/book/language: { source: /lang, default: en }
```

Read the first line as: *the output's `/book/title` comes from the input's
`/name`*. Locations on both sides are [JSON
Pointers](https://www.rfc-editor.org/rfc/rfc6901). The second pairing coerces
the value to a number with `as`. The third falls back to `en` with `default`
when the input has no `/lang`.

## 3. Provide an input

Save this as `input.json`:

```json
{ "name": "The Compleat Mapper", "published": "1998", "shelf": "B4" }
```

## 4. Apply the mapping

Save this as `main.js`:

```js
import Mapper from '@christiansmith/mapper-js'
import { parse } from '@std/yaml'

const mapping = parse(await Deno.readTextFile('mapping.yaml'))
const input = JSON.parse(await Deno.readTextFile('input.json'))

const mapper = new Mapper({}, { initializers: {}, transformers: {}, plugins: {} })
const { valid, errors, ...result } = await mapper.map(mapping, input)

console.log(JSON.stringify(result, null, 2))
```

Run it:

```sh
deno run --allow-read main.js
```

You should see:

```json
{
  "book": {
    "title": "The Compleat Mapper",
    "year": 1998,
    "language": "en"
  }
}
```

Three things happened. `as` turned `"1998"` into the number `1998`. `default`
filled in `language`. And `shelf` didn't come along. A mapping only reads
what it addresses. Unmapped input stays out of the output.

## 5. Let the mapping validate its output

Suppose a catalog entry is unusable without an ISBN. Add one more pairing to
`mapping.yaml`:

```yaml
/book/isbn: { source: /isbn, required: true }
```

Run `main.js` again, printing the whole envelope this time
(`console.log(valid, errors)`). The input has no `/isbn`, so instead of a
partial result you get:

```yaml
valid: false
errors:
  - { source: /isbn, required: true, message: required value }
```

Any error empties the result. The mapper never returns a half-valid document.
Add an `"isbn"` to the input and the mapping goes green again.

## Where you are

You've written a mapping document, applied it, and made it guard its own
output. That's the whole engine loop. Next: [Mapping
collections](/mapper/tutorials/mapping-collections/), where one mapping fans
out over an array of records.
