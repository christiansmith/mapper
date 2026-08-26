---
title: Determinism and portability
description: When the same mapping gives the same answer, and what carries across implementations.
sidebar:
  order: 6
---

## Determinism

A mapping over a given input produces the same output every time, under two
conditions. The keywords in play are deterministic: everything Core and
Extended is, while `random` and `unique` are Experimental precisely because
they are not. And the registered extensions are pure: a plugin that fetches,
a transformer that reads a clock, an initializer that mints UUIDs each
introduce exactly the nondeterminism they contain.

Both sources are visible. Nondeterministic keywords are named in the
document; impure extensions are named in the registration. A reader can audit
a mapping's determinism without running it.

One structural requirement supports this: mappings are **ordered** maps.
Pairing order is semantics, so the document must reach the evaluator with its
key order intact. Standard YAML and JSON parsers preserve insertion order;
anything that round-trips through an unordered structure corrupts the
program.

## Portability

The Core tier is the portable surface: any conforming implementation runs
Core documents identically. Extended keywords are optional but exact where
present. Experimental keywords carry no cross-implementation guarantee.

For mapper-js specifically, the released engine conforms to the
specification everywhere its conformance suite probes, as of 0.2.0. Two
narrow diagnostics are still to come (SPEC Appendix A), and these docs mark
them where they matter. Every example here runs against the published
package, so what you read is what you get.
