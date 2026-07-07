# mapper

Documentation for [Mapper](https://github.com/christiansmith/mapper-js) —
declarative, portable document mapping. Built with
[Starlight](https://starlight.astro.build) and organized on
[Diataxis](https://diataxis.fr).

Published at <https://christiansmith.github.io/mapper/>.

## Develop

With [Deno](https://deno.com) 2:

```
deno install --allow-scripts=npm:sharp
deno task dev
```

`deno task build` writes the production site to `dist/`; `deno task preview`
serves it locally. The site also builds under Node with `npm install &&
npm run build`.

## Tested examples

Every runnable example in these docs has a matching case in `test/cases/`,
executed against the published
[`@christiansmith/mapper-js`](https://jsr.io/@christiansmith/mapper-js)
release:

```
deno task test
```

An example and its case change together; a page can't drift from the engine
without the suite failing.

## License

[MIT](LICENSE) © Christian Smith
