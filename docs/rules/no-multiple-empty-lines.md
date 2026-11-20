---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-multiple-empty-lines"
description: "disallow multiple empty lines"
since: "v0.12.0"
---

# yml/no-multiple-empty-lines

> disallow multiple empty lines

- :gear: This rule is included in `configs.standard`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to reduce the scrolling required when reading through your code. It will warn when the maximum amount of empty lines has been exceeded.
Use `max: 0` if you want to remove all blank lines.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/no-multiple-empty-lines: 'error'

# ✓ GOOD
"GOOD":
  - "foo"
  - "bar"

# ✗ BAD
"BAD":
  - "foo"



  - "bar"
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/no-multiple-empty-lines:
  - error
  - max: 2
    maxEOF: 2
    maxBOF: 2
```

- `max` ... Enforces a maximum number of consecutive empty lines. Default is `2`.
- `maxEOF` ... Enforces a maximum number of consecutive empty lines at the end of files. Default is value specified for `max`.
- `maxBOF` ... Enforces a maximum number of consecutive empty lines at the beginning of files. Default is value specified for `max`.

Same as [no-multiple-empty-lines] rule option. See [here](https://eslint.org/docs/rules/no-multiple-empty-lines#options) for details.

## :couple: Related rules

- [no-multiple-empty-lines]

[no-multiple-empty-lines]: https://eslint.org/docs/rules/no-multiple-empty-lines

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.12.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-multiple-empty-lines.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-multiple-empty-lines.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-multiple-empty-lines)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-multiple-empty-lines)</sup>
