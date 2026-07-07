---
title: The mapping model
description: Target-wise descent, ordered pairings, and why the output shape drives everything.
sidebar:
  order: 1
---

Most data-transformation tools walk the input and decide what to emit. Mapper
inverts that. A mapping declares the *output* shape, and evaluation walks the
declaration: for each pairing, resolve the descriptor, write the result at
the target pointer. The input is only ever read where a descriptor points.
Nothing scans it. Unmapped input cannot leak, and cost follows the size of
the mapping and what it addresses, not the size of the input document.

Two rules complete the model.

**Undefined never writes.** A descriptor that resolves to nothing leaves the
output untouched. That is why array-descriptor fallbacks, `find` misses, and
absent optionals compose without conditionals: the failed alternative simply
writes nothing.

**Order is the program.** Pairings run in document order, and later pairings
read what earlier ones wrote:

```yaml
/a: { constant: 1 }
/b: { output: /a }
```

produces `{ "a": 1, "b": 1 }`. Reverse the pairings and `/b` writes nothing:
at that point `/a` does not exist yet. A mapping is closer to a small program
than to a set of rules, and the pairing sequence is its statement order.

Structure descriptors descend. A nested `mapping` evaluates its pairings
against a fresh target and writes the finished result back; `each` does that
once per array element. Descent is what keeps scopes clean: inside the nest,
pointers read from the narrowed source, and the parent output is reachable
only by name (`input:`, `output:`).

The consequence to internalize: you read a mapping the way you read the
output it produces, top to bottom. What a value is made from is written next
to where it lands.
