---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-empty-key"
description: "disallow empty mapping keys"
since: "v0.3.0"
---
# yml/no-empty-key

> disallow empty mapping keys

- :gear: This rule is included in `"plugin:yml/recommended"` and `"plugin:yml/standard"`.

## :book: Rule Details

This rule reports empty mapping keys.

<eslint-code-block>

<!-- eslint-skip -->

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
- [yml/no-empty-document]

[yml/no-empty-mapping-value]: ./no-empty-mapping-value.md
[yml/no-empty-sequence-entry]: ./no-empty-sequence-entry.md
[yml/no-empty-document]: ./no-empty-document.md

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-empty-key.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-empty-key.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-empty-key)
