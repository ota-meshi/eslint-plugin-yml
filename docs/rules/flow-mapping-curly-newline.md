---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/flow-mapping-curly-newline"
description: "enforce consistent line breaks inside braces"
---
# yml/flow-mapping-curly-newline

> enforce consistent line breaks inside braces

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent line breaks inside braces of flow mappings.

<eslint-code-block fix>

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

```json
{
  "yml/flow-mapping-curly-newline": ["error",
    "always" | "never" |
    {
       "multiline": true,
       "minProperties": 1,
       "consistent": true
    }
  ]
}
```

Same as [object-curly-newline] rule option. See [here](https://eslint.org/docs/rules/object-curly-newline#options) for details. 

## :couple: Related rules

- [object-curly-newline]

[object-curly-newline]: https://eslint.org/docs/rules/object-curly-newline

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/flow-mapping-curly-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/flow-mapping-curly-newline.js)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/object-curly-newline)</sup>
