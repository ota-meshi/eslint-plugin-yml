---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/block-sequence-hyphen-indicator-newline"
description: "enforce consistent line breaks after `-` indicator"
since: "v0.5.0"
---

# yml/block-sequence-hyphen-indicator-newline

> enforce consistent line breaks after `-` indicator

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to enforce consistent line breaks after `-` indicator.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/block-sequence-hyphen-indicator-newline: 'error'

# ✓ GOOD
- "GOOD"

# ✗ BAD
-
  "BAD"
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/block-sequence-hyphen-indicator-newline:
  - error
  - never # or "always" 
  - nestedHyphen: always # or "never"
```

- Styles
  - `"always"` ... Requires line breaks after after `-` indicator of block style sequences.
  - `"never"` ... Disallow line breaks after after `-` indicator of block style sequences.

- Properties
  - `nestedHyphen` ... Specifies the style to apply to nested hyphens. default `"always"`

## :couple: Related rules

- [yml/flow-sequence-bracket-newline](./flow-sequence-bracket-newline.md)
- [yml/flow-mapping-curly-newline](./flow-mapping-curly-newline.md)
- [yml/key-spacing](./key-spacing.md)
- [yml/block-mapping-question-indicator-newline](./block-mapping-question-indicator-newline.md)

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.5.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/block-sequence-hyphen-indicator-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/block-sequence-hyphen-indicator-newline.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/block-sequence-hyphen-indicator-newline)
