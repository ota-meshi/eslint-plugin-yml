---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-tab-indent"
description: "disallow tabs for indentation."
---
# yml/no-tab-indent

> disallow tabs for indentation.

- :gear: This rule is included in `"plugin:yml/recommended"`.

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

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-tab-indent.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-tab-indent.js)
