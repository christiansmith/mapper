// Executes every documented example against the published mapper-js release.
// Each YAML file in test/cases/ mirrors the runnable examples on one docs
// page (`page:` names the source file); a page's example and its case change
// together, in the same commit.
import { parse } from '@std/yaml'
import { assertEquals } from '@std/assert'
import Mapper from '@christiansmith/mapper-js'

const casesDir = new URL('./cases/', import.meta.url)

for await (const entry of Deno.readDir(casesDir)) {
  if (!entry.name.endsWith('.yaml')) continue
  const { page, cases } = parse(await Deno.readTextFile(new URL(entry.name, casesDir)))
  for (const { name, mapping, input, output } of cases) {
    Deno.test(`${page} — ${name}`, async () => {
      const mapper = new Mapper({}, { initializers: {}, transformers: {}, plugins: {} })
      const { valid, errors, ...result } = await mapper.map(structuredClone(mapping), structuredClone(input))
      assertEquals(errors, [])
      assertEquals(valid, true)
      assertEquals(result, output)
    })
  }
}
