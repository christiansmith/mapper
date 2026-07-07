# mapper

Documentation site for Mapper — the declarative document-mapping language —
built with [Starlight](https://starlight.astro.build) (Astro) and organized on
[Diataxis](https://diataxis.fr): tutorials, how-to guides, reference,
explanation. Deploys to GitHub Pages under the `/mapper` base path.

## Toolchain

Deno-first. Install and run:

```
deno install --allow-scripts=npm:sharp
deno task dev        # dev server (use `astro dev --background` when scripting)
deno task build      # production build to dist/
deno task test       # run every documented example against the published engine
```

The site must also build under Node (`npm install && npm run build`). Keep
both paths working; don't add Deno-only APIs to site code (the test harness
under `test/` is Deno-only by design).

Format JS with Prettier per `.prettierrc` (no semicolons). Markdown and MDX
content is hand-authored — don't reflow it mechanically.

## Working rules

- **Review before commit.** The maintainer reviews every change before it is
  committed. Do not commit or push without an explicit go-ahead.
- **Examples are executable.** Every runnable example on a docs page has a
  matching case in `test/cases/*.yaml` (one file per page; `page:` names the
  source file). `deno task test` runs each case against the pinned, published
  `@christiansmith/mapper-js` release. A page's example and its case change
  together, in the same commit — never edit one without the other.
- **Pinned engine.** The mapper-js version in `deno.json` imports is exact.
  Bumping it is a deliberate act, not a side effect.
- **Synthetic examples only.** No example data derived from real deployments,
  clients, or third parties.
- **Internal links include the base.** Write every internal link
  base-absolute (`/mapper/tutorials/first-mapping/`) — Astro does not prefix
  Markdown, hero, or component links, and relative links break on
  trailing-slash-less URLs (which the dev server itself hands out). If the
  base ever changes, it's one mechanical find-and-replace across
  `src/content/`; verify with the URL audit in `deno task test`.
- **Language-neutral prose.** Mapper is specified independently of any one
  implementation (see
  [SPEC.md](https://github.com/christiansmith/mapper-js/blob/main/SPEC.md)).
  Write prose about the language; put implementation-specific code in code
  blocks structured so tabs for other implementations can be added later.
- **Cite the spec for normative claims.** When a page states what Mapper
  MUST do (as opposed to what the released package does), link the SPEC
  section, and the requirement ID where one exists. Released-behavior
  divergences get a `:::caution` naming the version and, where listed, the
  Appendix A row.

## Multi-language examples (ahead of the second implementation)

Implementations in other languages will share these docs. Conventions, in
force now so the structure is ready:

- Mapping, input, and output blocks are language-independent. Never put them
  in language tabs.
- Host-code blocks (construction, invocation, extensions) are
  language-specific. When a second implementation lands, wrap them in
  Starlight `<Tabs syncKey="lang">` with JavaScript (Deno) as the first tab;
  until then, plain fences.
- Each language tab's runnable examples get their own corpus and runner,
  executed against that language's published package. The change-together
  rule applies per tab.
- Install and setup steps live in tutorials only; guides and reference assume
  a working installation and stay as language-free as the material allows.
