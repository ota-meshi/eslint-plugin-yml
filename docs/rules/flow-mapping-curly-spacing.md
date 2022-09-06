---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/flow-mapping-curly-spacing"
description: "enforce consistent spacing inside braces"
since: "v0.1.0"
---

# yml/flow-mapping-curly-spacing

> enforce consistent spacing inside braces

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent spacing inside braces of flow mappings.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/flow-mapping-curly-spacing: 'error'

# ✓ GOOD
- {a: b}

# ✗ BAD
- { a: b }
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/flow-mapping-curly-spacing:
  - error
  - always # or "never"
  - arraysInObjects: false
    objectsInObjects: false
```

Same as [object-curly-spacing] rule option. See [here](https://eslint.org/docs/rules/object-curly-spacing#options) for details.

## :couple: Related rules

- [object-curly-spacing]

[object-curly-spacing]: https://eslint.org/docs/rules/object-curly-spacing

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/flow-mapping-curly-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/flow-mapping-curly-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/flow-mapping-curly-spacing)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/object-curly-spacing)</sup>
