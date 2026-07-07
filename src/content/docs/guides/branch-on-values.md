---
title: Branch on values
description: Choose a mapping shape at runtime with switch.
sidebar:
  order: 3
---

To shape the output by a value in the input, switch on it. `switch` reads a
branch key with `source` and selects the matching descriptor from `cases`:

```yaml
/entry:
  switch:
    source: /kind
    cases:
      video:
        source: /
        mapping:
          /title: /title
          /minutes: { source: /duration, as: number }
      article:
        source: /
        mapping:
          /title: /title
          /pages: { source: /pageCount, as: number }
```

With a video record:

```json
{ "kind": "video", "title": "Mapping Live", "duration": "12" }
```

the output is:

```json
{ "entry": { "title": "Mapping Live", "minutes": 12 } }
```

With an article record:

```json
{ "kind": "article", "title": "On Mapping", "pageCount": "8" }
```

the output is:

```json
{ "entry": { "title": "On Mapping", "pages": 8 } }
```

A case can be any descriptor: a pointer, a nested mapping, or a `$ref` to a
registered mapping. An unmatched key selects nothing and the pairing writes
nothing.
