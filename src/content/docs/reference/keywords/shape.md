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

writes `2`. A case can be any descriptor. An unmatched key selects the
`default` case when `cases` carries one, and nothing otherwise.

### Switch scopes

`switch` carries a scope key naming where the branch key is read:

| Scope key | Reads from |
|---|---|
| `switch.source` | the pipeline value: whatever the outer locate produced |
| `switch.input` | the root input |
| `switch.output` | the output written so far |

`switch.source` reads the value flowing through the descriptor, not the
context's source scope. That makes branching on local state a composition:
locate the value with the outer keyword, then dispatch on it with
`switch.source: /`:

```yaml
/type: /kind
/label:
  target: /type
  switch:
    source: /
    cases:
      book: { constant: Book }
      film: { constant: Film }
```

```json
{ "kind": "film" }
```

writes `{ "type": "film", "label": "Film" }`. The outer `target: /type` reads
the value an earlier pairing wrote; `switch.source: /` branches on it.

`switch.output` reads from the root output, so a mapping that uses it knows
its own absolute output paths. A mapping registered for reuse cannot (a
`$ref`-able mapping has no way to know where its output will sit), so prefer
`switch.source` with an outer locate in anything meant to be composed.

`target` is not a switch scope key. A `switch` carrying only
`switch.target` does not dispatch at all: no case is selected, `default`
included, and the pipeline value passes through unchanged. Mapping
validation reports the missing scope key
([KW-switch-1](/mapper/reference/validation/)):

```yaml
/type: /kind
/label:
  target: /type
  switch:
    target: /
    cases:
      film: { constant: Film }
      default: { constant: Unknown }
```

```json
{ "kind": "film" }
```

writes `{ "type": "film", "label": "film" }`: the located value, not a case.

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
list chains steps. An object step carries exactly one key, the transformer's
name, whose value is passed as options; a step with more than one key is
invalid (SPEC §6.6, checked by
[mapping validation](/mapper/reference/validation/) as `KW-pipeline-1`):

```yaml
/slug: { source: /name, transform: slugify }
```

Instance-level validation also checks every named transformer against the
registry, the bare string form included: a name that matches no registered
transformer is a validation error (`KW-transform-1`), where evaluation would
silently skip the step. See [Write
extensions](/mapper/guides/write-extensions/) for the signature.

## random and unique

Experimental. `random` selects a random member; `unique` avoids repeats
across calls. Requesting more unique members than the array holds distinct
values is a diagnostic. Both keywords are nondeterministic, so they carry no
tested example and no portability guarantee.
