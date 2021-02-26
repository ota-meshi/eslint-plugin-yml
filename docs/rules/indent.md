---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/indent"
description: "enforce consistent indentation"
since: "v0.1.0"
---
# yml/indent

> enforce consistent indentation

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports enforces a consistent indentation style. The default style is 2 spaces.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/indent: 'error'

# ✓ GOOD
- a:
    b
  c:
    - d
    - e: f
      g: h

# ✗ BAD
- a:
   b
  c:
   - d
   -  e: f
      g: h
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/indent:
  - error
  - 2
```

Specify the number of indents.

## :couple: Related rules

- [indent]

[indent]: https://eslint.org/docs/rules/indent

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/indent.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/indent.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/indent)
