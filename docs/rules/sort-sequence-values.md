---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/sort-sequence-values"
description: "require sequence values to be sorted"
since: "v0.14.0"
---
# yml/sort-sequence-values

> require sequence values to be sorted

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks values of sequence and verifies that values are sorted alphabetically or specified order.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/sort-sequence-values: ['error', { pathPattern: '.*', order: { type: 'asc' } }]

# ✓ GOOD
good:
  - a
  - b
  - c

# ✗ BAD
bad:
  - a
  - c
  - b
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/sort-sequence-values:
  - error
  - pathPattern: ^files$ # Hits the files property
    order: { type: asc }
  - pathPattern: ^keywords$ # Hits the keywords property
    order:
      - eslint
      - eslintplugin
      - eslint-plugin
      - # Fallback order
        order: { type: asc }
```

The option receives multiple objects with the following properties:

- `pathPattern` (Required) ... Defines the regular expression pattern of paths to which you want to enforce the order. If you want to apply to the top level, define `"^$"`.
- `order` (Required) ... Defines how to enforce the order. You can use an object or an array.
  - Array ... Defines an array of values to enforce the order.
    - String ... Defines the value.
    - Object ... The object has the following properties:
      - `valuePattern` ... Defines a pattern to match the value. Default is to match all.
      - `order` ... The object has the following properties:
        - `type`:
          - `"asc"` ... Enforce values to be in ascending order. This is default.
          - `"desc"` ... Enforce values to be in descending order.
        - `caseSensitive` ... If `true`, enforce values to be in case-sensitive order. Default is `true`.
        - `natural` ... If `true`, enforce values to be in natural order. Default is `false`.
  - Object ... The object has the following properties:
    - `type`:
      - `"asc"` ... Enforce values to be in ascending order. This is default.
      - `"desc"` ... Enforce values to be in descending order.
    - `caseSensitive` ... If `true`, enforce values to be in case-sensitive order. Default is `true`.
    - `natural` ... If `true`, enforce values to be in natural order. Default is `false`.
- `minValues` ... Specifies the minimum number of values that a sequence should have in order for the sequence's unsorted values to produce an error. Default is `2`, which means by default all sequences with unsorted values will result in lint errors.

## :couple: Related rules

- [yml/sort-keys]

[yml/sort-keys]: ./sort-keys.md

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.14.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/sort-sequence-values.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/sort-sequence-values.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/sort-sequence-values)
