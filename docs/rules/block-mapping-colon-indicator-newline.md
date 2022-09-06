---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/block-mapping-colon-indicator-newline"
description: "enforce consistent line breaks after `:` indicator"
---

# yml/block-mapping-colon-indicator-newline

> enforce consistent line breaks after `:` indicator

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in .
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to enforce consistent line breaks after `:` indicator.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/block-mapping-colon-indicator-newline: 'error'

# ✓ GOOD
"GOOD" : "foo"

---

# ✗ BAD
"BAD":
  "bar"
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/block-mapping-colon-indicator-newline:
  - error
  - never # or "always" 
```

- `"always"` ... Requires line breaks after after `:` indicator of block style mappings.
- `"never"` ... Disallow line breaks after after `:` indicator of block style mappings.

## :couple: Related rules

- [yml/flow-sequence-bracket-newline](./flow-sequence-bracket-newline.md)
- [yml/flow-mapping-curly-newline](./flow-mapping-curly-newline.md)
- [yml/key-spacing](./key-spacing.md)
- [yml/block-mapping-question-indicator-newline](./block-mapping-question-indicator-newline.md)
- [yml/block-sequence-hyphen-indicator-newline](./block-sequence-hyphen-indicator-newline.md)

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/block-mapping-colon-indicator-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/block-mapping-colon-indicator-newline.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/block-mapping-colon-indicator-newline)
