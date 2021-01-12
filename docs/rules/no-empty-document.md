---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-empty-document"
description: "disallow empty document"
---
# yml/no-empty-document

> disallow empty document

- :gear: This rule is included in `"plugin:yml/recommended"`.

## :book: Rule Details

This rule reports empty mapping documents.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/no-empty-document: 'error'
---
# ✓ GOOD
"GOOD": "foo",
...
---
# ✗ BAD
...
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [yml/no-empty-key]
- [yml/no-empty-mapping-value]
- [yml/no-empty-sequence-entry]

[yml/no-empty-key]: ./no-empty-key.md
[yml/no-empty-mapping-value]: ./no-empty-mapping-value.md
[yml/no-empty-sequence-entry]: ./no-empty-sequence-entry.md

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-empty-document.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-empty-document.js)
