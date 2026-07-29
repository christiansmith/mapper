---
title: Shape keywords
description: switch, find, init, constant, template, and transform reshape the pipeline value.
sidebar:
  order: 5
---

Shape keywords replace or rework the located value before validation.

## switch

Core. Selects a case by a branch key. `source` inside `switch` reads the key;
`cases` maps keys to descriptors:

```yaml
/x:
  source: /
  switch:
    source: /kind
    cases:
      a: /valA
      b: /valB
```

```json
{ "kind": "b", "valA": 1, "valB": 2 }
```

writes `2`. A case can be any descriptor. An unmatched key selects nothing.
`switch.input` and `switch.output` read the branch key from the root input or
output instead of the switched value. Pair the outer locate keyword with the
matching switch scope.

## find

Core. Selects the first member of an array of objects whose fields equal
`eq`. `pointer` narrows the match to one field:

```yaml
/doi:
  source: /ids
  find:
    eq: { t: doi }
    pointer: /v
```

```json
{ "ids": [{ "t": "issn", "v": "2049-3630" }, { "t": "doi", "v": "10.1000/x" }] }
```

writes `"10.1000/x"`. No match writes nothing.

## init

Core. Calls a named initializer, which can supply a value where the input has
none:

```yaml
/subtitle: { source: /subtitle, init: placeholder }
```

With no `/subtitle` in the input and an initializer that fills `undefined`
with `"TBD"`, writes `"TBD"`. See [Write
extensions](/mapper/guides/write-extensions/).

## constant

Core. Replaces the value unconditionally:

```yaml
/v: { source: /a, constant: fixed }
```

writes `"fixed"` whatever `/a` holds.

## template

Core. Builds parameters by mapping the located value, then substitutes them
into `{{param}}` placeholders:

```yaml
/greeting:
  source: /p
  template: 'Hi {{n}}!'
  mapping:
    /n: /first
```

```json
{ "p": { "first": "Ada" } }
```

writes `"Hi Ada!"` to `/greeting`. The parameter pairings also write at their
own target pointers, so `/n` holds `"Ada"` in the output. Point parameters
where scratch data can live.

## transform

Core. Applies named transformers in order. A string names one transformer; a
list chains steps; an object step passes itself as options:

```yaml
/slug: { source: /name, transform: slugify }
```

See [Write extensions](/mapper/guides/write-extensions/) for the signature.

## random and unique

Experimental. `random` selects a random member; `unique` avoids repeats
across calls. Requesting more unique members than the array holds distinct
values is a diagnostic. Both keywords are nondeterministic, so they carry no
tested example and no portability guarantee.
