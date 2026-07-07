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
keyword catalog, and a known-deviations appendix for the reference
implementation.

## Tiers

| Tier | Meaning |
|---|---|
| **Core** | required of every implementation |
| **Extended** | optional; exact behavior if present (relative pointer references) |
| **Experimental** | unstable; no portability guarantee (`regexp_i`, `random`/`unique`, `stdout`) |

## Test suites

The spec ships with an executable YAML conformance suite in the mapper-js
repository. These docs carry their own suite: every runnable example on every
page executes against the published `@christiansmith/mapper-js` release. A
page cannot drift from the engine without a test failing.

Where the reference implementation deviates from the specification, these
docs describe the released behavior and mark it, as in the
[validation caution](/mapper/reference/keywords/validate/). The full
deviation list is SPEC Appendix A.
