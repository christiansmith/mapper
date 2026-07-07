// Guards the internal-link convention: every internal link in content is
// base-absolute (/mapper/...). Relative links break on trailing-slash-less
// URLs (which the dev server hands out), and slash-links without the base
// 404 under GitHub Pages. Astro prefixes none of them.
import { assertEquals } from '@std/assert'

const BASE = '/mapper/'
const contentDir = new URL('../src/content/docs/', import.meta.url)

const ok = (target) =>
  /^(https?:)?\/\//.test(target) || // external
  /^(mailto|tel):/.test(target) || // protocol links
  target.startsWith('#') || // in-page anchor
  target === BASE.slice(0, -1) ||
  target.startsWith(BASE) // base-absolute internal

async function* files(dir) {
  for await (const entry of Deno.readDir(dir)) {
    const url = new URL(entry.name + (entry.isDirectory ? '/' : ''), dir)
    if (entry.isDirectory) yield* files(url)
    else if (/\.(md|mdx)$/.test(entry.name)) yield url
  }
}

Deno.test('internal links are base-absolute', async () => {
  const offenders = []
  for await (const url of files(contentDir)) {
    const text = await Deno.readTextFile(url)
    const targets = [
      ...[...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]), // markdown links
      ...[...text.matchAll(/href="([^"]+)"/g)].map((m) => m[1]), // component hrefs
      ...[...text.matchAll(/^\s*link:\s*(\S+)$/gm)].map((m) => m[1]) // hero actions
    ]
    for (const target of targets) {
      if (!ok(target)) offenders.push(`${url.pathname.split('/src/content/')[1]}: ${target}`)
    }
  }
  assertEquals(offenders, [])
})
