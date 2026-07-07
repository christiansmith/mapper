---
title: Mapping collections
description: Fan a mapping out over an array with each, pick single elements with find, and let later pairings read earlier results.
sidebar:
  order: 2
---

In [Your first mapping](/mapper/tutorials/first-mapping/) you reshaped one
record. Real
inputs carry lists. In this tutorial one mapping handles a whole catalog:
you'll map every element of an array, pluck a single element out of it, and
see why the order of pairings matters.

Keep the project from the first tutorial. Only `mapping.yaml` and
`input.json` change.

## 1. A collection input

Replace `input.json`:

```json
{
  "records": [
    { "name": "On Mapping", "published": "1998", "featured": true },
    { "name": "Pointers Everywhere", "published": "2004" },
    { "name": "The Fan-Out", "published": "2011" }
  ]
}
```

## 2. Map every element with `each`

Replace `mapping.yaml`:

```yaml
/catalog/books:
  source: /records
  each:
    /title: /name
    /year: { source: /published, as: number }
```

`source` points the descriptor at the array in `/records`. `each` applies its
pairings to every element, each against a fresh target. Run `main.js`:

```json
{
  "catalog": {
    "books": [
      { "title": "On Mapping", "year": 1998 },
      { "title": "Pointers Everywhere", "year": 2004 },
      { "title": "The Fan-Out", "year": 2011 }
    ]
  }
}
```

Inside `each`, pointers like `/name` read from the *element*. The scope
shifted when the mapping descended into the array.

## 3. Pick one element with `find`

Sometimes you want a single member, not the whole list. Add a pairing:

```yaml
/catalog/featured:
  source: /records
  find:
    eq: { featured: true }
    pointer: /name
```

`find` selects the first element whose fields equal `eq`, and `pointer`
narrows the match to one field. Run again and `catalog.featured` is
`"On Mapping"`.

## 4. Order is semantics

Pairings run in document order, and later pairings can read what earlier ones
wrote. Add one more at the *bottom* of `mapping.yaml`:

```yaml
/banner/headline: { output: /catalog/featured }
```

`output` reads from the output document produced so far. This pairing quotes
the result of step 3:

```json
{
  "catalog": {
    "books": [ "…" ],
    "featured": "On Mapping"
  },
  "banner": { "headline": "On Mapping" }
}
```

Move that pairing to the *top* of the file and run again. `banner` vanishes:
at that point nothing has written `/catalog/featured` yet. Order is part of
the meaning. A mapping is a program, not a bag of rules.

## Where you are

One mapping now reshapes a collection, extracts from it, and builds on its
own earlier results. Next: [Extending the
mapper](/mapper/tutorials/extending-the-mapper/), where your own functions
join the pipeline.
