---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/flow-mapping-curly-spacing"
description: "enforce consistent spacing inside braces"
since: "v0.1.0"
---

# yml/flow-mapping-curly-spacing

> enforce consistent spacing inside braces

- :gear: This rule is included in `configs.standard`.
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
    emptyObjects: ignore
```

This rule has two options, a string option and an object option.

- First option:

  - `"never"` (default) disallows spacing inside of braces
  - `"always"` requires spacing inside of braces (except `{}`)

- Second option:

  - `"arraysInObjects"` control spacing inside of braces of mappings beginning and/or ending with a sequence element.
    - `true` requires spacing inside of braces of mappings beginning and/or ending with a sequence element (applies when the first option is set to `never`)
    - `false` disallows spacing inside of braces of mappings beginning and/or ending with a sequence element (applies when the first option is set to `always`)
  - `"objectsInObjects"` control spacing inside of braces of mappings beginning and/or ending with a mapping element.
    - `true` requires spacing inside of braces of mappings beginning and/or ending with a mapping element (applies when the first option is set to `never`)
    - `false` disallows spacing inside of braces of mappings beginning and/or ending with a mapping element (applies when the first option is set to `always`)
  - `"emptyObjects"` control spacing within empty mappings.
    - `"ignore"`(default) do not check spacing in empty mappings.
    - `"always"` require a space in empty mappings.
    - `"never"` disallow spaces in empty mappings.

These options are almost identical to those of the [@stylistic/object-curly-spacing] rule. See the [@stylistic/object-curly-spacing options](https://eslint.style/rules/object-curly-spacing#options) for details.

## :couple: Related rules

- [@stylistic/object-curly-spacing]
- [object-curly-spacing]

[object-curly-spacing]: https://eslint.org/docs/rules/object-curly-spacing
[@stylistic/object-curly-spacing]: https://eslint.style/rules/object-curly-spacing

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/flow-mapping-curly-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/flow-mapping-curly-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/flow-mapping-curly-spacing)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/object-curly-spacing)</sup>
