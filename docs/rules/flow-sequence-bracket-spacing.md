---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/flow-sequence-bracket-spacing"
description: "enforce consistent spacing inside flow sequence brackets"
since: "v0.1.0"
---

# yml/flow-sequence-bracket-spacing

> enforce consistent spacing inside flow sequence brackets

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent spacing inside flow sequence brackets.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/flow-sequence-bracket-spacing: 'error'

# ✓ GOOD
- [1, 2]

# ✗ BAD
- [ 1, 2 ]
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/flow-sequence-bracket-spacing:
  - error
  - always # or "never"
  - singleValue: true
    objectsInArrays: true
    arraysInArrays: true
```

Same as [array-bracket-spacing] rule option. See [here](https://eslint.org/docs/rules/array-bracket-spacing#options) for details.

## :couple: Related rules

- [array-bracket-spacing]

[array-bracket-spacing]: https://eslint.org/docs/rules/array-bracket-spacing

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/flow-sequence-bracket-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/flow-sequence-bracket-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/flow-sequence-bracket-spacing)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/array-bracket-spacing)</sup>
