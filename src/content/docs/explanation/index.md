---
title: Explanation
description: Understanding-oriented discussion of the mapping model, its design, and the ideas behind it.
sidebar:
  order: 0
---

Why Mapper works the way it does:

- [The mapping model](/mapper/explanation/mapping-model/): target-wise
  descent, ordered pairings, and why the output shape drives everything.
- [Documents as data](/mapper/explanation/documents-as-data/): mappings are
  documents, and that is the point.
- [Context threading and the async model](/mapper/explanation/context-and-async/):
  one rule for scope, one place for asynchrony.
- [Where values come from](/mapper/explanation/evaluation-scopes/): one
  vocabulary of scopes, used the same way everywhere.
- [Validation before evaluation](/mapper/explanation/mapping-validation/):
  why mapping validity is checkable in one pass, and why the report never
  throws.
- [Determinism and portability](/mapper/explanation/determinism/): when the
  same mapping gives the same answer.
- [Policy at construction](/mapper/explanation/policy-at-construction/): why
  deployment policy lives in configuration, never in the mapping.
- [Serving mappings](/mapper/explanation/serving-mappings/): registered vs
  explicit mappings, and what statelessness buys.
- [These docs and the specification](/mapper/explanation/docs-and-spec/):
  what is normative where.
