---
title: Catching mistakes before they run
description: Use mapping validation to find a broken mapping's problems in one pass, then gate evaluation on a clean report.
sidebar:
  order: 4
---

In this tutorial you'll break a mapping twice, let the validator find both
problems without running anything, and finish with an evaluation that only
happens once the mapping is known good.

It builds on [Extending the mapper](/mapper/tutorials/extending-the-mapper/):
you'll reuse the project and the `slugify` transformer from there. If you
skipped it, any project with mapper-js installed and a `slugify` transformer
registered will do.

## 1. Write a mapping with two mistakes

Save this as `post.yaml`. Both mistakes are the realistic kind: a wrong
operand and a typo:

```yaml
mapping:
  /post/title: /title
  /post/slug: { source: /title, transform: sluggify }
  /post/words: { source: /words, as: integer }
```

Note the shape: the pairings sit under a `mapping:` key. That is the form
the validator takes; `map` accepts bare pairings and wraps them itself;
`validate` does not.

## 2. Validate the mapping

Save this as `check.js`:

```js
import Mapper, { validate } from '@christiansmith/mapper-js'
import { parse } from '@std/yaml'

const post = parse(await Deno.readTextFile('post.yaml'))
console.log(JSON.stringify(validate(post), null, 2))
```

Run `deno run --allow-read check.js`. The report finds the bad operand:

```yaml
valid: false
errors:
  - rule: KW-pipeline-1
    message: as must be string, number, boolean, or json
    pointer: /mapping/~1post~1words/as
    descriptor: integer
warnings: []
```

Read the diagnostic inside out: `descriptor` is the offending value,
`pointer` is where it sits in your mapping (`~1` is how a pointer spells
`/` inside a key), and `rule` names the requirement it violates. Nothing
ran; validation never evaluates.

Notice what it did *not* find: `sluggify` looks fine to a document-level
check. Whether a transformer exists is a fact about an instance, not about
the document.

## 3. Fix the operand, then validate against the instance

Change `as: integer` to `as: number` in `post.yaml`. Then ask the mapper you
actually run, the one from *Extending the mapper* with `slugify`
registered, to validate:

```js
const mapper = new Mapper({}, { initializers: {}, transformers, plugins: {} })
console.log(JSON.stringify(mapper.validate(post), null, 2))
```

```yaml
valid: false
errors:
  - rule: KW-transform-1
    message: sluggify matches no registered transformer
    pointer: /mapping/~1post~1slug/transform
    descriptor: sluggify
warnings: []
```

The typo is caught, by name, at the exact position. Without validation this
mapping would have *run silently*, because an unknown transformer is
skipped at evaluation, and `/post/slug` would have carried the unslugged
title until someone noticed downstream.

## 4. Fix the typo and go green

Change `sluggify` to `slugify` and run `check.js` once more:

```yaml
valid: true
errors: []
warnings: []
```

## 5. Gate evaluation on the report

Now wire the check into the run itself. In `main.js`:

```js
const report = mapper.validate(post)
if (!report.valid) throw new Error(JSON.stringify(report.errors))

const { valid, errors, ...result } = await mapper.map(post, {
  title: 'Maps All the Way Down',
  words: '1200'
})
console.log(JSON.stringify(result, null, 2))
```

```json
{
  "post": {
    "title": "Maps All the Way Down",
    "slug": "maps-all-the-way-down",
    "words": 1200
  }
}
```

The gate costs one synchronous call and can never throw on its own:
validation always returns a report. Evaluation still validates the *input*
(that's `valid` and `errors` in the envelope); the gate ensures the
*mapping* was never the problem.

## Where you are

You've seen the two validation positions find different classes of mistake,
read diagnostics by `pointer` and `rule`, and gated evaluation on a clean
report. The full report contract is on [Mapping
validation](/mapper/reference/validation/); the CI version of the gate is in
[Validate a mapping](/mapper/guides/validate-mappings/).
