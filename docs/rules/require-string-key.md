---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/require-string-key"
description: "disallow mapping keys other than strings"
since: "v0.3.0"
---
# yml/require-string-key

> disallow mapping keys other than strings

## :book: Rule Details

This rule reports mapping keys defined with an other than a string.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/require-string-key: 'error'

# ✓ GOOD
"GOOD": 42

# ✗ BAD
42 : "BAD"
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/require-string-key.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/require-string-key.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/require-string-key)
