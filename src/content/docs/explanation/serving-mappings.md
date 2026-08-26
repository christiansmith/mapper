---
title: Serving mappings
description: Why mapper-http separates registered from explicit mappings, and what statelessness buys.
sidebar:
  order: 8
---

Putting a mapper behind HTTP changes one thing that changes everything: the
mapping author and the deployment operator stop being the same person. Every
design decision in [mapper-http](/mapper/guides/serve-over-http/) follows
from taking that seriously.

## Two kinds of mapping, two trust levels

A **registered** mapping is deployment content. It arrived with the image or
the mounted `MAPPINGS` source, the operator chose it, and callers only get
to name it. An **explicit** mapping is caller content: the document itself
arrives in the request. These are different trust levels, so the API keeps
them structurally apart: `POST /map` discriminates on the *type* of
`mapping`, a string naming the registered form, an object carrying the
explicit form.

The discrimination is what makes the policy legible. The registered form is
string-only, so no request against a registered-only deployment can smuggle
in a mapping document; the explicit form is off by default, separately
claims-gated, and enabling it is one deliberate act with a name
(`map.explicit`). Capability by capability, the operator decides who may
run deployment content, who may submit their own, and who may only
validate.

## Statelessness is the security property

An explicit mapping evaluates and vanishes. References resolve against the
submitted mapping first, then the installed registry; nothing the caller
submits registers into the server, and no other request can observe that
the submission happened. This closes the real hazard of a shared mapping
service, one caller's mapping changing what another caller's request
means, and it is why the explicit form can be offered to callers at all.
Earlier designs that let a submitted mapping register into the shared
instance turned every authorized caller into a registry author; `0.3`
removed that path deliberately.

## Validate first, and as its own right

Every explicit mapping is [validated](/mapper/reference/validation/) before
evaluation: an invalid mapping is refused with the full report, at 422,
and never reaches the engine. The same check stands alone as
`POST /validate`, and granting it is independent of granting evaluation.

The validate-but-never-evaluate posture is more useful than it looks: it
lets a mapping author (a person, a CI job, an agent) develop against a
live instance's real extension surface, iterating on reports, with no
ability to run anything. Validation never executes extensions and never
touches an input, so offering it costs the deployment nothing but the
traversal.

## Policy stays out of the mappings

The server adds the deployment half of the [policy
separation](/mapper/explanation/policy-at-construction/): auth and
per-capability claims, body-size limits enforced during the stream read,
and a stock extension surface whose request plugin forwards no
caller-supplied headers. Mappings, registered or explicit, carry none of
this. The same mappings that run behind one deployment's strict gates run
behind another's open ones, because the gates were never in the mappings.
