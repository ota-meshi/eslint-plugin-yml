---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-empty-key"
description: "disallow empty mapping keys"
---
# yml/no-empty-key

> disallow empty mapping keys

- :gear: This rule is included in `"plugin:yml/recommended"`.

## :book: Rule Details

This rule reports empty mapping keys.

<eslint-code-block>

```yaml
# eslint yml/no-empty-key: 'error'

# ✓ GOOD
"GOOD": "foo"

# ✗ BAD
: "BAD"
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [yml/no-empty-mapping-value]
- [yml/no-empty-sequence-entry]

[yml/no-empty-mapping-value]: ./no-empty-mapping-value.md
[yml/no-empty-sequence-entry]: ./no-empty-sequence-entry.md

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-empty-key.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-empty-key.js)
