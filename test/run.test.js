// Executes every documented example against the published mapper-js release.
// Each YAML file in test/cases/ mirrors the runnable examples on one docs
// page (`page:` names the source file); a page's example and its case change
// together, in the same commit.
//
// Case shape: { name, mapping, input, output } for a successful mapping, or
// { name, mapping, input, errors } for one that must fail validation (the
// envelope reports the errors and the result is empty — no partial output).
// A case may carry `mappings`, a registry passed to the constructor for
// $ref/$extend resolution.
//
// A case with `validate: document` or `validate: instance` exercises mapping
// validation instead of evaluation: `mapping` is the document handed to the
// operation, and `report` is the expected { valid, errors, warnings } report.
// Instance-level cases validate against a Mapper carrying the case's
// `mappings` registry and the shared extension surface in test/extensions.js.
import { parse } from '@std/yaml'
import { assertEquals } from '@std/assert'
import Mapper, { validate } from '@christiansmith/mapper-js'
import { initializers, transformers, plugins } from './extensions.js'

const casesDir = new URL('./cases/', import.meta.url)

for await (const entry of Deno.readDir(casesDir)) {
  if (!entry.name.endsWith('.yaml')) continue
  const { page, cases } = parse(await Deno.readTextFile(new URL(entry.name, casesDir)))
  for (const c of cases) {
    Deno.test(`${page} — ${c.name}`, async () => {
      const mapper = new Mapper({ mappings: structuredClone(c.mappings ?? {}) }, { initializers, transformers, plugins })

      if (c.validate) {
        const report =
          c.validate === 'document'
            ? validate(structuredClone(c.mapping))
            : mapper.validate(structuredClone(c.mapping))
        // compare reports as JSON serializes them, like error envelopes below
        assertEquals(JSON.parse(JSON.stringify(report)), c.report)
        return
      }

      const { valid, errors, ...result } = await mapper.map(structuredClone(c.mapping), structuredClone(c.input))
      if (c.errors) {
        assertEquals(valid, false)
        // compare errors as JSON serializes them — the docs show what a
        // reader printing the envelope sees
        assertEquals(JSON.parse(JSON.stringify(errors)), c.errors)
        assertEquals(result, {})
      } else {
        assertEquals(errors, [])
        assertEquals(valid, true)
        assertEquals(result, c.output)
      }
    })
  }
}
