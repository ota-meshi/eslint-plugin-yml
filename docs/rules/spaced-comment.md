---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/spaced-comment"
description: "enforce consistent spacing after the `#` in a comment"
since: "v0.1.0"
---

# yml/spaced-comment

> enforce consistent spacing after the `#` in a comment

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule will enforce consistency of spacing after the start of a comment `#`. It also provides several exceptions for various documentation styles.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/spaced-comment: 'error'

# ✓ GOOD

#✗ BAD
```

</eslint-code-block>

ESLint core `spaced-comment` rule don't work well in YAML. Turn off that rule in YAML files and use `yml/spaced-comment` rule.  
Use the `overrides` setting to apply these only to YAML files:

```js
module.exports = {
  overrides: [
    {
      files: ["*.yaml", "*.yml"],
      parser: "yaml-eslint-parser",
      rules: {
        "spaced-comment": ["off"],
        "yml/spaced-comment": ["error"],
      },
    },
  ],
};
```

## :wrench: Options

```yaml
yml/spaced-comment:
  - error
  - always # or "never"
  - exceptions: []
    markers: []
```

- First option
  - `"always"` ... the `#` must be followed by at least one whitespace.
  - `"never"` ... should be no whitespace following.
- Second option
  - `"exceptions"` ... It is an array of string patterns which are considered exceptions to the rule. The rule will not warn when the pattern starts from the beginning of the comment and repeats until the end of the line. Please note that exceptions are ignored if the first argument is `"never"`.
  - `"markers"` ... It is an array of string patterns which are considered markers for docblock-style comments. The `"markers"` array will apply regardless of the value of the first argument, e.g. `"always"` or `"never"`.

See also [here](https://eslint.org/docs/rules/spaced-comment#options).

## :couple: Related rules

- [spaced-comment]

[spaced-comment]: https://eslint.org/docs/rules/spaced-comment

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/spaced-comment.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/spaced-comment.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/spaced-comment)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/spaced-comment)</sup>
