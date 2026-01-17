---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/key-spacing"
description: "enforce consistent spacing between keys and values in mapping pairs"
since: "v0.3.0"
---

# yml/key-spacing

> enforce consistent spacing between keys and values in mapping pairs

- :gear: This rule is included in `configs.standard`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent spacing between keys and values in mapping pairs. In the case of long lines, it is acceptable to add a new line wherever whitespace is allowed.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/key-spacing: 'error'
---
{
  # ✓ GOOD
  "GOOD": "foo",
  # ✗ BAD
  "BAD" :"bar"
}
---
# ✓ GOOD
- "GOOD": "foo"
- ? "GOOD"
  : "foo"

```

</eslint-code-block>

## :wrench: Options

```yaml
yml/key-spacing:
  - error
  - beforeColon: false
    afterColon: true
    mode: strict # or "minimum"
    # "align": "value" or "colon"
    # "singleLine": {}
    # "multiLine": {}
```

Same as [key-spacing] rule option. See [here](https://eslint.org/docs/rules/key-spacing#options) for details.

## :couple: Related rules

- [key-spacing]

[key-spacing]: https://eslint.org/docs/rules/key-spacing

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/key-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/key-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/key-spacing)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/key-spacing)</sup>
