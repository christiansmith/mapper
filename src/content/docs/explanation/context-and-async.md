---
title: Context threading and the async model
description: One rule for scope, one place for asynchrony.
sidebar:
  order: 3
---

## One rule for scope

Evaluation threads a context: input, output, error accumulator, registries,
plus the current read scope (`source`), write scope (`target`), and their
absolute paths. Descending into a nested mapping or an `each` element makes a
child context by one rule: **share everything, rebind `source`, `target`,
and `paths`.**

The shared parts explain the long-range behaviors. A validation failure three
levels deep reaches the envelope because every level appends to the same
`errors`. An `output:` read inside a nest sees earlier top-level writes
because every level shares the same output. The rebound parts explain the
local behaviors: inside `each`, a bare pointer reads the element, and writes
land in a fresh target.

The full record is in the [context
reference](/mapper/reference/context/).

## One place for asynchrony

Pairings run sequentially. Within one pairing, fan-out is parallel: `each`
elements and variant alternatives evaluate concurrently. Plugins are the only
asynchronous stage; initializers and transformers are synchronous by rule.

Those three facts compose into a predictable concurrency model. A mapping
with no plugins completes without I/O. A plugin inside `each` fans its calls
out in parallel, one per element. Plugins in separate pairings run in
sequence, because pairings do. Where you place a plugin in the document
decides the concurrency you get, and you can read it off the mapping.
