---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/sort-keys"
description: "require mapping keys to be sorted"
---
# yml/sort-keys

> require mapping keys to be sorted

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks all pair definitions of mapping and verifies that all keys are sorted alphabetically.

<eslint-code-block fix>

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

Same as [sort-keys] rule option. See [here](https://eslint.org/docs/rules/sort-keys#options) for details.

## :couple: Related rules

- [sort-keys]

[sort-keys]: https://eslint.org/docs/rules/sort-keys

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/sort-keys.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/sort-keys.js)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/sort-keys)</sup>
