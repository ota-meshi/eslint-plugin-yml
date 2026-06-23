---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-trailing-spaces"
description: "disallow trailing whitespace at the end of lines"
since: "v3.5.0"
---

# yml/no-trailing-spaces

> disallow trailing whitespace at the end of lines

- :gear: This rule is included in `configs.standard`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallows trailing whitespace at the end of lines.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/no-trailing-spaces: 'error'

# ✓ GOOD
"GOOD": "foo"

# ✗ BAD
"BAD": "bar"
#         ^ trailing whitespace at the end of the previous line
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/no-trailing-spaces:
  - error
  - skipBlankLines: false
    ignoreComments: false
```

- `skipBlankLines` ... Ignores whitespace-only lines. Default is `false`.
- `ignoreComments` ... Ignores trailing whitespace in YAML comments. Default is `false`.

Same as [no-trailing-spaces] rule option. See [here](https://eslint.org/docs/rules/no-trailing-spaces#options) for details.

## :couple: Related rules

- [no-trailing-spaces]

[no-trailing-spaces]: https://eslint.org/docs/rules/no-trailing-spaces

## :rocket: Version

This rule was introduced in eslint-plugin-yml v3.5.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-trailing-spaces.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-trailing-spaces.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-trailing-spaces)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-trailing-spaces)</sup>
