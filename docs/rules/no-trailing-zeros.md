---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-trailing-zeros"
description: "disallow trailing zeros for floats"
---

# yml/no-trailing-zeros

> disallow trailing zeros for floats

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the removal of unnecessary trailing zeros from floats.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/no-trailing-zeros: 'error'

# ✓ GOOD
"GOOD": 1.2

# ✗ BAD
'BAD': 1.20
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-trailing-zeros.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-trailing-zeros.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-trailing-zeros)
