---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/quotes"
description: "enforce the consistent use of either double, or single quotes"
---
# yml/quotes

> enforce the consistent use of either double, or single quotes

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the consistent use of either double or single quotes.

<eslint-code-block fix>

```yaml
# eslint yml/quotes: 'error'

# ✓ GOOD
"GOOD": "foo"

# ✗ BAD
'BAD': 'bar'
```

</eslint-code-block>

## :wrench: Options

```yaml
"yml/quotes":
  - "error"
  - "prefer": "double" | "single"
    "avoidEscape": true
```

- `prefer`
  - `"double"` ... requires the use of double quotes wherever possible. It's default.
  - `"single"` ... requires the use of single quotes wherever possible.
- `avoidEscape` ... If `true`, allows strings to use single-quotes or double-quotes so long as the string contains a quote that would have to be escaped otherwise.

## :couple: Related rules

- [quotes]
- [yml/plain-scalar]

[quotes]: https://eslint.org/docs/rules/quotes
[yml/plain-scalar]: ./plain-scalar.md

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/quotes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/quotes.js)
