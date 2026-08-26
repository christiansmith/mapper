// Executes the request-plugin examples against the published
// @christiansmith/mapper-request release. A local fixture server stands in
// for the remote host: each case's `fixtures` maps pathnames to responses,
// and every occurrence of the literal origin `https://api.example.test` in
// the case is rewritten to the fixture server's origin before the mapping
// runs — pages show the stable origin, the suite runs against the fixture.
//
// Case shape mirrors test/run.test.js: { name, config?, fixtures, mapping,
// input, output } runs the mapping through the engine with a request plugin
// built by createRequest(config). A fixture value is a JSON body, or
// { redirect: <location> } for a 302, or { echo: true } to reflect the
// request's headers and body back as JSON. A case may expect
// { rejects: <substring> } instead of `output` when the plugin must throw.
// `config.checkUrl: refuse-private` installs the destination policy shown on
// the fetch-remote-data page (refuse loopback and private ranges).
import { parse } from '@std/yaml'
import { assertEquals, assertRejects, assertStringIncludes } from '@std/assert'
import Mapper from '@christiansmith/mapper-js'
import mapperRequest from '@christiansmith/mapper-request'

const ORIGIN = 'https://api.example.test'
const casesDir = new URL('./request-cases/', import.meta.url)

const policies = {
  'refuse-private': (url) => {
    const { hostname } = new URL(url)
    if (
      hostname === 'localhost' ||
      /^(127\.|10\.|192\.168\.|169\.254\.)/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    ) {
      throw new Error(`Refused destination: ${url}`)
    }
  }
}

function serve(fixtures) {
  const server = Deno.serve({ hostname: '127.0.0.1', port: 0, onListen: () => {} }, async (req) => {
    const { pathname, search } = new URL(req.url)
    const fixture = fixtures[pathname + search] ?? fixtures[pathname]
    if (fixture === undefined) return new Response('not found', { status: 404 })
    if (fixture.delay) {
      await new Promise((resolve) => setTimeout(resolve, fixture.delay))
      return Response.json(fixture.body ?? {})
    }
    if (fixture.redirect) {
      return new Response(null, { status: 302, headers: { location: fixture.redirect } })
    }
    if (fixture.echo) {
      return Response.json({
        headers: Object.fromEntries(req.headers),
        body: req.body ? await req.json() : null
      })
    }
    return Response.json(fixture)
  })
  return { server, origin: `http://127.0.0.1:${server.addr.port}` }
}

const swap = (value, origin) => JSON.parse(JSON.stringify(value).replaceAll(ORIGIN, origin))

for await (const entry of Deno.readDir(casesDir)) {
  if (!entry.name.endsWith('.yaml')) continue
  const { page, cases } = parse(await Deno.readTextFile(new URL(entry.name, casesDir)))
  for (const c of cases) {
    Deno.test(`${page} — ${c.name}`, async () => {
      const { server, origin } = serve(c.fixtures ?? {})
      try {
        const config = { ...c.config }
        if (config.checkUrl) config.checkUrl = policies[config.checkUrl]
        const request = mapperRequest.createRequest(config)
        const mapper = new Mapper({}, { plugins: { request } })
        const run = () => mapper.map(swap(c.mapping, origin), swap(c.input, origin))
        if (c.rejects) {
          const error = await assertRejects(run)
          assertStringIncludes(error.message, swap(c.rejects, origin))
        } else {
          const { valid, errors, ...result } = await run()
          assertEquals(errors, [])
          assertEquals(valid, true)
          assertEquals(result, swap(c.output, origin))
        }
      } finally {
        await server.shutdown()
      }
    })
  }
}
