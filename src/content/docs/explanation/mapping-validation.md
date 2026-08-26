---
title: Validation before evaluation
description: Why mapping validity is checkable in one pass, and why the report never throws.
sidebar:
  order: 5
---

A mapping is a document, and documents can be wrong. Before mapping
validation existed, there was exactly one way to find out: run the mapping
and see. That conflates two different questions, *is this document a valid
mapping?* and *does this input satisfy it?*, and it answers the first one
at the worst possible time, during evaluation, possibly in production,
possibly silently. [Mapping validation](/mapper/reference/validation/)
separates the questions: the document's validity as a mapping is decidable
by looking at the document, so Mapper decides it in one pass, ahead of any
input.

## Well-formedness and reachability are different facts

Some defects are visible in the document alone: a `find` without its `eq`, a
transform step carrying two keys, a pointer with a bad escape. Others are
only defects *relative to somewhere*: `transform: slugify` is perfectly
well-formed, and broken on every instance that has no `slugify`. That is why
the operation exists in two positions. Document-level validation checks what
the document can answer for itself; instance-level validation adds the
question the document cannot answer: does every name I use exist *here*?

Keeping the two apart keeps reports honest. A well-formedness check never
depends on where you run it. A reachability diagnostic always names the
registry state it was checked against. Validate against the instance you
will evaluate on, and the report is a promise about that instance.

## Reports, not exceptions

Validation never throws. A document that is not even an object comes back as
a report saying so. This is the same decision the evaluator made about
constraint failures (problems are data, delivered in a shape you can
route, count, and store) applied one layer earlier. It matters most at
boundaries: a service validating submitted mappings answers every submission
with a report, and never turns a malformed document into a 500. The report
is deterministic (diagnostics in document order, every problem reported,
not just the first) so the same document gets the same report everywhere,
and a fix list is a fix list, not a loop of resubmissions each revealing one
more error.

## Warnings are for the legal-but-suspect

Some findings are not defects. A descriptor key that names no keyword and no
installed extension is inert, evaluation will ignore it, but it usually
means a misspelled plugin name. An unregistered name *might* be registered
at evaluation time. Calling these errors would make validity depend on
guesses; ignoring them would waste what the traversal learned. So the report
carries them as warnings, and warnings never affect `valid`. The contract
stays crisp, `valid: true` means the document will not be rejected, while
the suspicious still surfaces.

## What validation refuses to know

Validation never evaluates, never calls an extension, never touches an
input. The cost of that discipline is modest: validation cannot promise the
mapping *works*, only that it is a mapping. A clean report plus a bad input
still yields evaluation errors: that is [the other error
shape](/mapper/reference/errors/), doing its own job. The benefit is that
validation is safe anywhere: on untrusted documents, in a request path, in
CI on every commit ([Validate a mapping](/mapper/guides/validate-mappings/)),
or behind an HTTP endpoint that grants validation rights without evaluation
rights ([Validate over HTTP](/mapper/guides/validate-over-http/)). A check
that cannot execute anything can be offered to anyone.
