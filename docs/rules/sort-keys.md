---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/sort-keys"
description: "require mapping keys to be sorted"
since: "v0.3.0"
---
# yml/sort-keys

> require mapping keys to be sorted

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks all pair definitions of mapping and verifies that all keys are sorted alphabetically or specified order.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/sort-keys: 'error'

# ✓ GOOD
good:
  a: 1
  b: 2
  c: 3

# ✗ BAD
bad:
  a: 1
  c: 3
  b: 2
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/sort-keys:
  - error
  # For example, a definition for eslintrc
  - pathPattern: ^$ # Hits the root properties
    order: 
      - root
      - plugins
      - extends
      - env
      - rules
      - overrides
      # ...
  - pathPattern: ^env$
    order: { type: asc }
  - pathPattern: ^rules$
    order: { type: asc }
  # ...
```

The option receives multiple objects with the following properties:

- `pathPattern` (Required) ... Defines the regular expression pattern of paths to which you want to enforce the order. If you want to apply to the top level, define `"^$"`.
- `hasProperties` ... Defines an array of property names. Checks only objects that have the defined properties.
- `order` (Required) ... Defines how to enforce the order. You can use an object or an array.
  - Array ... Defines an array of properties to enforce the order.
    - String ... Defines the property name.
    - Object ... The object has the following properties:
      - `keyPattern` ... Defines a pattern to match the property name. Default is to match all.
      - `order` ... The object has the following properties:
        - `type`:
          - `"asc"` ... Enforce properties to be in ascending order. This is default.
          - `"desc"` ... Enforce properties to be in descending order.
        - `caseSensitive` ... If `true`, enforce properties to be in case-sensitive order. Default is `true`.
        - `natural` ... If `true`, enforce properties to be in natural order. Default is `false`.
  - Object ... The object has the following properties:
    - `type`:
      - `"asc"` ... Enforce properties to be in ascending order. This is default.
      - `"desc"` ... Enforce properties to be in descending order.
    - `caseSensitive` ... If `true`, enforce properties to be in case-sensitive order. Default is `true`.
    - `natural` ... If `true`, enforce properties to be in natural order. Default is `false`.
- `minKeys` ... Specifies the minimum number of keys that an object should have in order for the object's unsorted keys to produce an error. Default is `2`, which means by default all objects with unsorted keys will result in lint errors.

You can also define options in the same format as the [sort-keys] rule.

```yaml
yml/sort-keys:
  - error
  - asc
  - caseSensitive: true
    natural: false
    minKeys: 2
```

See [here](https://eslint.org/docs/rules/sort-keys#options) for details.

## :couple: Related rules

- [sort-keys]

[sort-keys]: https://eslint.org/docs/rules/sort-keys

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/sort-keys.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/sort-keys.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/sort-keys)
