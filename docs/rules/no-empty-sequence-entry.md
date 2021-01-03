---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-empty-sequence-entry"
description: "disallow empty sequence entries"
---
# yml/no-empty-sequence-entry

> disallow empty sequence entries

- :gear: This rule is included in `"plugin:yml/recommended"`.

## :book: Rule Details

This rule reports empty sequence entries.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/no-empty-sequence-entry: 'error'

# ✓ GOOD
- "GOOD"

# ✗ BAD
- 
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [yml/no-empty-key]
- [yml/no-empty-sequence-entry]

[yml/no-empty-key]: ./no-empty-key.md
[yml/no-empty-sequence-entry]: ./no-empty-sequence-entry.md

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-empty-sequence-entry.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-empty-sequence-entry.js)
