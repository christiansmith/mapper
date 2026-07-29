---
title: Conformance and the specification
description: Tiers, the normative spec, and the test suites.
sidebar:
  order: 6
---

Mapper is specified independently of any implementation. The normative source
is
[SPEC.md](https://github.com/christiansmith/mapper-js/blob/main/SPEC.md) in
the mapper-js repository: RFC-style requirements, normative pseudocode, a
keyword catalog, and an appendix recording where the reference
implementation has deviated and what remains open.

## Tiers

| Tier | Meaning |
|---|---|
| **Core** | required of every implementation |
| **Extended** | optional; exact behavior if present (relative pointer references) |
| **Experimental** | unstable; no portability guarantee (`regexp_i`, `random`/`unique`, `stdout`) |

## Test suites

The spec ships with an executable YAML conformance suite in the mapper-js
repository. As of release 0.2.0, the published engine passes all 189 cases:
the twelve deviations once recorded in SPEC Appendix A are resolved, and the
probes that pinned them are conformance cases now. The appendix still lists
two narrow diagnostics that are planned but not yet raised; these docs mark
both where they matter, as in the
[coercion caution](/mapper/reference/keywords/finalize/).

These docs carry their own suite: every runnable example on every page
executes against the published `@christiansmith/mapper-js` release. A page
cannot drift from the engine without a test failing.
