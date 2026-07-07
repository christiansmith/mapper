---
title: Locate keywords
description: source, target, input, and output select where a descriptor reads.
sidebar:
  order: 1
---

Locate keywords run first. They select the value the rest of the pipeline
works on.

## source

Core. Reads from the current source scope, and scopes descendant descriptors
to what it read.

```yaml
/name: { source: /user/name }
```

```json
{ "user": { "name": "Ada" } }
```

writes `"Ada"` to `/name`.

## target

Core. Reads what earlier pairings wrote at the current nesting level.

```yaml
/id: { constant: 7 }
/copy: { target: /id }
```

produces `{ "id": 7, "copy": 7 }`.

## input

Core. Reads from the root input, regardless of scope. Use it to escape a
nested scope:

```yaml
/out:
  source: /nested
  mapping:
    /fromScope: /val
    /fromRoot: { input: /rootVal }
```

```json
{ "rootVal": "R", "nested": { "val": "V" } }
```

produces `{ "out": { "fromScope": "V", "fromRoot": "R" } }`.

## output

Core. Reads from the root output produced so far. Later pairings see earlier
writes:

```yaml
/a: { constant: 1 }
/b: { output: /a }
```

produces `{ "a": 1, "b": 1 }`.
