// Executes every documented example against the published mapper-js release.
// Each YAML file in test/cases/ mirrors the runnable examples on one docs
// page (`page:` names the source file); a page's example and its case change
// together, in the same commit.
//
// Case shape: { name, mapping, input, output } for a successful mapping, or
// { name, mapping, input, errors } for one that must fail validation (the
// envelope reports the errors and the result is empty — no partial output).
import { parse } from '@std/yaml'
import { assertEquals } from '@std/assert'
import Mapper from '@christiansmith/mapper-js'
import { initializers, transformers, plugins } from './extensions.js'

const casesDir = new URL('./cases/', import.meta.url)

for await (const entry of Deno.readDir(casesDir)) {
  if (!entry.name.endsWith('.yaml')) continue
  const { page, cases } = parse(await Deno.readTextFile(new URL(entry.name, casesDir)))
  for (const c of cases) {
    Deno.test(`${page} — ${c.name}`, async () => {
      const mapper = new Mapper({}, { initializers, transformers, plugins })
      const { valid, errors, ...result } = await mapper.map(structuredClone(c.mapping), structuredClone(c.input))
      if (c.errors) {
        assertEquals(valid, false)
        // compare errors as JSON serializes them — the engine's error objects
        // carry undefined-valued keys that never survive serialization, and
        // the docs show what a reader printing the envelope sees
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
