---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/plain-scalar"
description: "require or disallow plain style scalar."
since: "v0.3.0"
---
# yml/plain-scalar

> require or disallow plain style scalar.

- :gear: This rule is included in `"plugin:yml/standard"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to use consistent style of plain or quoted styles.

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/plain-scalar: 'error'

# ✓ GOOD
GOOD: GOOD

# ✗ BAD
"BAD": 'BAD'
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/plain-scalar:
  - error
  - always # or "never"
```

- `"always"` ... Enforce the use of plain style scalars.
- `"never"` ... Disallow the use of plain style scalars.

## :couple: Related rules

- [yml/quotes]

[yml/quotes]: ./quotes.md

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/plain-scalar.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/plain-scalar.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/plain-scalar)
