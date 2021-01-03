---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/block-mapping"
description: "require or disallow block style mappings."
---
# yml/block-mapping

> require or disallow block style mappings.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to use consistent style of block or flow styles.

<eslint-code-block fix>

```yaml
# eslint yml/block-mapping: 'error'

# ✓ GOOD
- a: b
  c: d
- { foo: bar }

# ✗ BAD
- { a: b,
  c: d }
```

</eslint-code-block>

## :wrench: Options

```yaml
"yml/block-mapping":
  - "error"
  - "always" # or "never"
# or
"yml/block-mapping":
  - "error"
  - "singleline": "always" # or "never" or "ignore"
    "multiline": "always" # or "never" or "ignore"
```

- Styles
  - `"always"` ... Enforce the use of block style mappings.
  - `"never"` ... Disallow the use of block style mappings.
  - `"ignore"` ... Does not apply consistent style.

- Properties
  - As a string ... Specify the style you want to apply to mappings.
  - `"singleline"` ... Specify the style you want to apply when the mapping is single-line. default `"ignore"`
  - `"multiline"` ... Specify the style you want to apply when the mapping is multi-line. default `"always"`

### `"always"`

<eslint-code-block fix>

```yaml
# eslint yml/block-mapping: ['error', 'always']

# ✓ GOOD
- a: b
  c: d

# ✗ BAD
- { foo: bar }
- { a: b,
  c: d }
```

</eslint-code-block>

### `"never"`

<eslint-code-block fix>

```yaml
# eslint yml/block-mapping: ['error', 'never']

# ✓ GOOD
- { foo: bar }
- { a: b,
  c: d }

# ✗ BAD
- foo: bar
- a: b
  c: d
```

</eslint-code-block>

## :couple: Related rules

- [yml/block-sequence]

[yml/block-sequence]: ./block-sequence.md

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/block-mapping.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/block-mapping.js)
