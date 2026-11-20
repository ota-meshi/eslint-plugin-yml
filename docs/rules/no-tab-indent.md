---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-tab-indent"
description: "disallow tabs for indentation."
since: "v0.1.0"
---

# yml/no-tab-indent

> disallow tabs for indentation.

- :gear: This rule is included in `configs.recommended` and `configs.standard`.

## :book: Rule Details

This rule disallows tabs for indentation.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/no-tab-indent: 'error'

# ✗ BAD
		foo: bar
...
		- bar
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-tab-indent.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-tab-indent.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-tab-indent)
