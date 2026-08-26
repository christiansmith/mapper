---
title: Policy at construction
description: Why deployment policy lives in extension configuration and never in the mapping.
sidebar:
  order: 7
---

A mapping describes *what* to produce. Where requests may go, how long to
wait, which headers reach the wire: those are facts about a *deployment*,
and the Mapper family keeps them out of mapping documents on principle. This
page explains the principle, using the [request
plugin](/mapper/reference/request-plugin/) as the worked example.

## Two authors, two channels

A mapping document and a deployment configuration usually have different
authors. Mappings travel: they are data, they get stored, submitted,
shared, and, behind a service like
[mapper-http](/mapper/explanation/serving-mappings/), authored by callers.
Configuration does not travel: it is written by whoever operates the
process, once, at construction.

That difference is why `createRequest(config)` exists. Everything
security-relevant (`timeoutMs`, `allowHeaders`, `checkUrl`,
`maxResponseBytes`) is fixed in the factory's closure. A descriptor can
describe any request it likes; it cannot loosen the policy it runs under,
because the policy was decided before any mapping arrived. The alternative,
policy keywords in the descriptor, would mean every mapping author is a
policy author, precisely backwards for documents designed to be passed
around.

## Portability is what the separation buys

A mapping that carries no policy runs anywhere. The same document works in
a test harness with a fixture server, on a laptop against staging, and in
production behind strict egress, because "where may requests go" was never
the document's business. Policy differences between those environments live
in three lines of construction code, not in three variants of every
mapping.

This is the same shape as the rest of the extension system: mappings name
capabilities (`request`, `slugify`), deployments decide what those names
mean and how far they reach. The names are portable; the reach is local.

## Boundaries, not guesses

The request plugin's fixed behaviors follow one rule: when data steers a
request, hold the boundary at a point data cannot reach.

- **Redirects are refused**, always. The upstream chooses the redirect
  target; following it would let a response steer the request somewhere the
  deployment never approved.
- **`checkUrl` sees the final URL** before any connection. For deployments
  that [fetch URLs arriving as data](/mapper/guides/fetch-remote-data/),
  the useful posture is a network-position guard (refuse loopback,
  private, and link-local ranges) rather than a site allowlist that needs
  a redeploy per new target.
- **Time and size are bounded** because unbounded reads are a policy
  decision nobody made.

A string check on the URL is the cheap gate, and it is honest about its
limits: it cannot see what a hostname will resolve to. Network egress rules
are the robust wall; `checkUrl` keeps well-behaved mappings from ever
testing it. Belt, then braces: configuration first, network second, and
nothing in the mapping deciding either.
