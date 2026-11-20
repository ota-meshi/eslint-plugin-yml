---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-empty-sequence-entry"
description: "disallow empty sequence entries"
since: "v0.3.0"
---

# yml/no-empty-sequence-entry

> disallow empty sequence entries

- :gear: This rule is included in `configs.recommended` and `configs.standard`.

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
- [yml/no-empty-document]

[yml/no-empty-key]: ./no-empty-key.md
[yml/no-empty-sequence-entry]: ./no-empty-sequence-entry.md
[yml/no-empty-document]: ./no-empty-document.md

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-empty-sequence-entry.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-empty-sequence-entry.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-empty-sequence-entry)
