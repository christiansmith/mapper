---
title: Documents as data
description: Mappings are documents, and that is the point.
sidebar:
  order: 2
---

A mapping is a YAML or JSON document. That sounds like a syntax choice. It is
the design.

Because a mapping is data, it can live where data lives. Store it in a
database and select it per tenant. Send it over the wire and run it on the
other side. Diff it in review like any other file. Generate it from another
program. Validate it against a schema. None of that works when
transformations are code.

Behavior stays out of the document by construction. Everything effectful or
computed lives in named extensions the host registers: the document says
`transform: slugify` or names a plugin, and what that means is decided at
construction time. The same document runs against a test directory in one
deployment and a live API in another. The document carries intent; the host
carries capability.

Push the idea further and a mapping becomes a program in the flow-based
sense: data flowing through declared connections, with pairing order as the
program counter. The specification's worked examples include a flow-style
document that serves as an HTTP request handler: early pairings assemble
request parameters, a plugin pairing performs the lookup, later pairings
shape the response. No framework code, one document. See SPEC §9.2.

This is also why Mapper is specified independently of JavaScript. A document
that carries intent shouldn't care which language executes it. The
[specification](https://github.com/christiansmith/mapper-js/blob/main/SPEC.md)
pins the semantics so implementations in other languages run the same
documents the same way.
