---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/flow-mapping-curly-newline"
description: "enforce consistent line breaks inside braces"
since: "v0.1.0"
---

# yml/flow-mapping-curly-newline

> enforce consistent line breaks inside braces

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent line breaks inside braces of flow mappings.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/flow-mapping-curly-newline: 'error'

# ✓ GOOD
- { a: b }
- {
    a: b
  }

# ✗ BAD
- {
    a: b }
- { a: b
  }
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/flow-mapping-curly-newline:
  - error
  - always # or "never"
---
# or
yml/flow-mapping-curly-newline:
  - error
  - multiline: true
    minProperties: 1
    consistent: true
```

Same as [object-curly-newline] rule option. See [here](https://eslint.org/docs/rules/object-curly-newline#options) for details.

## :couple: Related rules

- [object-curly-newline]

[object-curly-newline]: https://eslint.org/docs/rules/object-curly-newline

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/flow-mapping-curly-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/flow-mapping-curly-newline.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/flow-mapping-curly-newline)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/object-curly-newline)</sup>
