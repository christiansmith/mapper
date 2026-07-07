---
title: Variant keywords
description: Array descriptors, first, last, all, and concat evaluate alternatives.
sidebar:
  order: 4
---

Variants evaluate a list of descriptors and pick from the results.

## Array descriptor form

Core. An array where a descriptor goes means alternatives. The first defined
result wins:

```yaml
/name: ['/nickname', '/fullName']
```

## first

Core. Explicit form of the array descriptor: the first defined result.

```yaml
/v: { first: ['/missing', '/b'] }
```

```json
{ "b": 2 }
```

writes `2`.

## last

Core. The last defined result:

```yaml
/v: { last: ['/a', '/missing'] }
```

```json
{ "a": 1 }
```

writes `1`.

## all

Core. Every defined result, as an array:

```yaml
/v: { all: ['/a', '/b'] }
```

```json
{ "a": 1, "b": 2 }
```

writes `[1, 2]`.

## concat

Core. Flattens an array result one level. Useful with `all` when the
alternatives are themselves arrays:

```yaml
/v: { all: ['/a', '/b'], concat: true }
```

```json
{ "a": [1, 2], "b": [3] }
```

writes `[1, 2, 3]`.
