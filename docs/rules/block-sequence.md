---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/block-sequence"
description: "require or disallow block style sequences."
since: "v0.1.0"
---
# yml/block-sequence

> require or disallow block style sequences.

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to use consistent style of block or flow styles.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/block-sequence: 'error'

# ✓ GOOD
a:
  - 1
  - 2
b: [1, 2]

# ✗ BAD
c: [
  1,
  2
]
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/block-sequence:
  - error
  - always # or "never"
---
# or
yml/block-sequence:
  - error
  - singleline: always # or "never" or "ignore"
    multiline: always # or "never" or "ignore"
```

- Styles
  - `"always"` ... Enforce the use of block style sequences.
  - `"never"` ... Disallow the use of block style sequences.
  - `"ignore"` ... Does not apply consistent style.

- Properties
  - As a string ... Specify the style you want to apply to sequences.
  - `"singleline"` ... Specify the style you want to apply when the sequence is single-line. default `"ignore"`
  - `"multiline"` ... Specify the style you want to apply when the sequence is multi-line. default `"always"`

### `"always"`

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/block-sequence: ['error', 'always']

# ✓ GOOD
a:
  - 1
  - 2

# ✗ BAD
b: [1, 2]
c: [
  1,
  2
]
```

</eslint-code-block>

### `"never"`

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/block-sequence: ['error', 'never']

# ✓ GOOD
a: [1, 2]
b: [
  1,
  2
]

# ✗ BAD
c:
  - 1
  - 2
d:
  - 1
```

</eslint-code-block>

## :couple: Related rules

- [yml/block-mapping]

[yml/block-mapping]: ./block-mapping.md

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/block-sequence.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/block-sequence.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/block-sequence)
