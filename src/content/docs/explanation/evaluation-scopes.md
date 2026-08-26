---
title: Where values come from
description: One vocabulary of scopes (source, target, input, output) and why it recurs everywhere.
sidebar:
  order: 4
---

Every read in a mapping names a scope, whether or not you see the name. A
bare pointer pairing reads `source`. A `switch` names the scope its branch
key comes from. The request plugin's `url` names the scope the URL comes
from. It is one vocabulary, four scopes, used the same way everywhere. This
page is about what each scope *is*, so you can predict any scoped read
without consulting the engine.

## Two fixed scopes, two moving ones

`input` and `output` are fixed. They name the roots: the document the caller
passed in, and the document being assembled for them. Wherever evaluation
stands, three levels deep in nested `each` even, `input: /currency` and
`output: /currency` mean what they mean at the top.

`source` and `target` move with evaluation. They are the local frame: the
value currently being read, and the container currently being built.
Descending into a nested mapping rebinds both; everything else is shared.
That is the whole scope discipline, and it is why deep mappings stay
readable: a pairing's meaning depends on its position, not on hidden state.

## The pipeline value

`source` deserves precision, because more than the `source:` keyword feeds
it. A descriptor is a pipeline: locate, reshape, validate, finalize. The
value flowing through that pipeline starts as the context's source, and each
stage hands the next one its result. When a scoped read says `source`, it
reads *the value flowing through the descriptor at that point*, not some
original, unrefined source.

Three consequences fall out:

- **Under `each`, `source` is the element.** The fan-out rebinds the frame
  per element, so an element's pairings, and any plugin option scoped to
  `source`, see that element, not the array.
- **After a plugin, `source` is the plugin's result.** Chained plugins each
  receive their predecessor's output as the value.
- **`switch.source` branches on the located value.** The outer locate
  refines the pipeline value first; the switch reads its branch key from the
  result. That is what makes the composition idiom work: locate local state
  with `target:`, dispatch on it with `switch.source` (see [Switch
  scopes](/mapper/reference/keywords/shape/)).

The precedent runs through the whole language: anything that needs "the
value being worked on" scopes it as `source`, and anything that needs a
fixed point of reference scopes `input` or `output`.

## Why output reads see only what is finished

`output` reads are how pairings collaborate: accumulate request parameters,
then hand them to a plugin; write a currency once, then copy it into every
row. The rule that makes this sound is document order. A pairing can read
through `output:` whatever earlier pairings finished writing, and nothing
of the pairing still in flight, because its result attaches to the output
only when it completes. Order is the program; an `output:` read is a read of
the program so far.

```yaml
/params/type: { constant: books }
/params/id: /request/bookId
/query: { output: /params }
```

```json
{ "request": { "bookId": "b1" } }
```

produces:

```json
{
  "params": { "type": "books", "id": "b1" },
  "query": { "type": "books", "id": "b1" }
}
```

The third pairing reads back what the first two built, the same idiom that
feeds a fetch in [Fetch remote data](/mapper/guides/fetch-remote-data/).

## One vocabulary, on purpose

Extensions adopt the same four names rather than inventing their own. The
request plugin's `url: { source: … }` reads the pipeline value exactly as
`switch.source` does; its `input`/`output` forms read the roots exactly as
the locate keywords do. When you meet a scoped option anywhere in the Mapper
family, the reading is the one described here. The reference table is on
[Context and envelope](/mapper/reference/context/).
