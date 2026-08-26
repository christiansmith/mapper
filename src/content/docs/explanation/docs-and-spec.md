---
title: These docs and the specification
description: What is normative where.
sidebar:
  order: 9
---

Mapper has two written surfaces with different jobs.

**The specification prescribes.**
[SPEC.md](https://github.com/christiansmith/mapper-js/blob/main/SPEC.md), in
the mapper-js repository, is the normative definition: RFC-style requirement
language with stable requirement IDs, normative pseudocode for the
algorithms, a keyword catalog, conformance tiers, and an executable YAML
conformance suite. Implementers in any language work from the spec.

**These docs describe.** They teach the language and document the released
`@christiansmith/mapper-js` as it behaves, in Diataxis form: tutorials to
learn by, guides to solve with, reference to look up, and these explanations.
Where the released engine falls short of the spec, the docs describe the
released behavior and mark it, as with the [coercion
caution](/mapper/reference/keywords/finalize/). The record of resolved and
outstanding deviations is SPEC Appendix A.

The two stay honest by the same mechanism. The spec's inline examples are
executable cases in its conformance suite; every runnable example in these
docs is a case in the site's own suite, executed against the published
package. Neither document can drift from behavior without a test failing.

If you are deciding where to read: using Mapper from JavaScript, stay here;
implementing Mapper, or arguing about what an edge case *should* do, go to
the spec.
