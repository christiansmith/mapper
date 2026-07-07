---
title: Keyword catalog
description: Every Mapper keyword by pipeline stage, with tier, grammar, and a tested example.
sidebar:
  order: 0
---

Descriptors are built from keywords. Each keyword acts at a fixed stage of
the evaluation pipeline. This catalog groups them by stage:

| Group | Keywords | Stage |
|---|---|---|
| [Locate](/mapper/reference/keywords/locate/) | `source` `target` `input` `output` | locate |
| [Structure](/mapper/reference/keywords/structure/) | `mapping` `each` | structure |
| [Registry](/mapper/reference/keywords/registry/) | `$id` `$ref` `$extend` `description` | registry |
| [Variants](/mapper/reference/keywords/variants/) | array form, `first` `last` `all` `concat` | locate/shape |
| [Shape](/mapper/reference/keywords/shape/) | `switch` `find` `init` `constant` `template` `transform` `random` `unique` | shape |
| [Validate](/mapper/reference/keywords/validate/) | `type` `minimum` `maximum` `multipleOf` `minLength` `maxLength` `enum` `pattern` `required` | validate |
| [Finalize](/mapper/reference/keywords/finalize/) | `default` `as` `regexp_i` | finalize |
| [Plugins](/mapper/reference/keywords/plugins/) | plugin keys, `pointer`, `stdout` | plugins |

Tiers: **Core** keywords are required of every implementation. **Extended**
keywords are optional, exact if present. **Experimental** keywords are
unstable. See [Conformance](/mapper/reference/conformance/).

Unknown descriptor keys that name no registered plugin have no behavior.
