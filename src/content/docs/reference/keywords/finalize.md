---
title: Finalize keywords
description: default fills gaps and as coerces types, after validation.
sidebar:
  order: 7
---

Finalize keywords run last, after validation.

## default

Core. Fills `undefined` only. Runs after validation, so it does not satisfy
constraints:

```yaml
/v: { source: /missing, default: fallback }
```

with an empty input writes `"fallback"`.

## as

Core. Coerces the value: `string`, `number`, `boolean`, or `json`.

```yaml
/n: { source: /n, as: string }
```

```json
{ "n": 7 }
```

writes `"7"`. Coercion with `as` happens before validation keywords see the
value, so `as: number` with `type: number` validates the coerced value. On
an absent value, `as` writes nothing.

:::caution
`as: number` of a value that is not numeric yields `NaN`, which serializes
as `null`, and mapper-js 0.3.2 reports no error. A diagnostic is planned
(SPEC Appendix A, KW-as-1).
:::

## regexp_i

Experimental. Wraps the value as a case-insensitive regular expression
source:

```yaml
/re: { source: /s, regexp_i: true }
```

```json
{ "s": "abc" }
```

writes `"/abc/i"`.
