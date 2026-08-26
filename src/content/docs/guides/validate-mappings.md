---
title: Validate a mapping before you run it
description: Check mapping documents with validate, read the report, and gate evaluation on it.
sidebar:
  order: 5
---

A mapping that arrives from a file, a request, or another team may not be a
valid mapping. Check it first; evaluate only what validates.

## Check a mapping's form

The named export checks well-formedness; no instance needed. Wrap pairings
under `mapping:` (the same shape the registry stores; `validate` does not
wrap bare pairing maps the way `map` does):

```js
import { validate } from '@christiansmith/mapper-js'

const report = validate(mapping)
```

```yaml
mapping:
  /year: { source: /published, as: integer }
```

```yaml
valid: false
errors:
  - rule: KW-pipeline-1
    message: as must be string, number, boolean, or json
    pointer: /mapping/~1year/as
    descriptor: integer
warnings: []
```

The `pointer` walks into the mapping document you passed (`~1` is an
escaped `/`), `rule` names the violated requirement, and every problem reports at once.
Fix the list, not one error per run.

## Check it against your instance

The method form adds reachability: do the names the mapping uses exist on
this instance?

```js
const report = mapper.validate(mapping)
```

```yaml
mapping:
  /slug: { source: /title, transform: sluggify }
```

against an instance registering a `slugify` transformer:

```yaml
valid: false
errors:
  - rule: KW-transform-1
    message: sluggify matches no registered transformer
    pointer: /mapping/~1slug/transform
    descriptor: sluggify
warnings: []
```

Validate against the instance you will evaluate on: reachability is a fact
about that instance, not about the mapping.

## Gate evaluation on the report

The idiom is two lines, and it turns silent degradation into a refusal:

```js
const report = mapper.validate(mapping)
if (!report.valid) throw new Error(JSON.stringify(report.errors))

const { valid, errors, ...result } = await mapper.map(mapping, input)
```

Validation checks the mapping; evaluation still checks the input. Both
`valid`s matter, and they answer different questions; see the [error
model](/mapper/reference/errors/).

## Treat warnings as review items

`warnings` never block. They flag the legal-but-suspect, most usefully a
descriptor key that names no keyword and no installed extension, which
evaluation would silently ignore. Only the instance level can know what is
installed, so this warning comes from `mapper.validate`:

```yaml
mapping:
  /book: { source: /id, requets: {} }
```

```yaml
valid: true
errors: []
warnings:
  - rule: KW-2
    message: requets matches no keyword or registered extension
    pointer: /mapping/~1book/requets
    descriptor: {}
```

A misspelled plugin name is exactly this shape. Print warnings in
development; page nobody over them in production.

## Validate in CI

Mapping documents in a repository can be validated on every commit, no
input, no network:

```js
// validate.test.js
import { parse } from '@std/yaml'
import { validate } from '@christiansmith/mapper-js'

for await (const entry of Deno.readDir('./mappings')) {
  Deno.test(entry.name, async () => {
    const mapping = parse(await Deno.readTextFile(`./mappings/${entry.name}`))
    const report = validate(mapping)
    if (!report.valid) throw new Error(JSON.stringify(report.errors, null, 2))
  })
}
```

Swap `validate` for an instance's `mapper.validate`, constructed with the
extensions the deployment really installs, and the gate covers reachability
too. To offer the same gate over the network, see [Validate over
HTTP](/mapper/guides/validate-over-http/).
