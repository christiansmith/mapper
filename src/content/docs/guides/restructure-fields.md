---
title: Restructure fields
description: Rename, move, flatten, and nest fields with pointer pairings.
sidebar:
  order: 1
---

Every pairing is a rename. The left side says where the value goes. The right
side says where it comes from. Both are JSON Pointers.

To flatten a nested input:

```yaml
/title: /book/title
/author: /book/author/name
/year: { source: /book/published, as: number }
```

```json
{ "book": { "title": "On Mapping", "author": { "name": "Hopper" }, "published": "1998" } }
```

becomes:

```json
{ "title": "On Mapping", "author": "Hopper", "year": 1998 }
```

To nest a flat input, point the other way:

```yaml
/book/title: /title
/book/author/name: /author
```

```json
{ "title": "On Mapping", "author": "Hopper" }
```

becomes:

```json
{ "book": { "title": "On Mapping", "author": { "name": "Hopper" } } }
```

Intermediate containers appear as needed. You never declare them.
