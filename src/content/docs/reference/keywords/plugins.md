---
title: Plugin keywords
description: Any descriptor key that names a registered plugin calls it; pointer narrows the result.
sidebar:
  order: 8
---

Plugins are the pipeline's only asynchronous stage. There is no fixed plugin
keyword: any descriptor key that names a registered plugin calls it, with the
key's value as options.

```yaml
/publisher: { source: /publisherId, publishers: {} }
```

The located value flows into the plugin. The plugin's return value replaces
it. With a `publishers` plugin that looks ids up in a directory and input
`{ "publisherId": "p1" }`, the pairing writes the publisher record.

## pointer

Core. In a plugin's options, narrows its result:

```yaml
/publisherName: { source: /publisherId, publishers: { pointer: /name } }
```

writes just the record's `name`.

## Chaining

Multiple plugin keys on one descriptor chain in document order. Each receives
the previous plugin's result as its value.

## stdout

Experimental. Prints the value for diagnosis after the mapping completes. It
never affects the result, and it carries no tested example because its output
is a side effect.

Signatures and the extension contract: [Write
extensions](/mapper/guides/write-extensions/).
