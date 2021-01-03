---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/flow-sequence-bracket-newline"
description: "enforce linebreaks after opening and before closing flow sequence brackets"
---
# yml/flow-sequence-bracket-newline

> enforce linebreaks after opening and before closing flow sequence brackets

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces line breaks after opening and before closing flow sequence brackets.

<eslint-code-block fix>

```yaml
# eslint yml/flow-sequence-bracket-newline: 'error'

# ✓ GOOD
- [ 1, 2, 3 ]
- [
    1,
    2,
    3
  ]

# ✗ BAD
- [
    1, 2, 3
  ]
- [ 1, 2, 3
  ]
- [
    1, 2, 3]
```

</eslint-code-block>

## :wrench: Options

```yaml
"yml/flow-sequence-bracket-newline":
  - "error"
  - "always" # or "never" or "consistent"
  - "multiline": true
    "minItems": null
```

Same as [array-bracket-newline] rule option. See [here](https://eslint.org/docs/rules/array-bracket-newline#options) for details.

## :couple: Related rules

- [array-bracket-newline]

[array-bracket-newline]: https://eslint.org/docs/rules/array-bracket-newline

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/flow-sequence-bracket-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/flow-sequence-bracket-newline.js)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/array-bracket-newline)</sup>
