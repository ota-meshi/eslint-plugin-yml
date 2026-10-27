---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/max-len"
description: "enforce a maximum line length"
---

# yml/max-len

> enforce a maximum line length

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule enforces a maximum line length in YAML files.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/max-len: 'error'

# ✓ GOOD
short: value

# ✗ BAD
long: this plain scalar makes the line longer than the default limit of eighty characters
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/max-len:
  - error
  - code: 80
    tabWidth: 4
    comments: 80
    ignorePattern: ""
    ignoreComments: false
    ignoreTrailingComments: false
    ignoreUrls: false
    ignoreStrings: false
```

- `code` ... The maximum line length. Default is `80`.
- `tabWidth` ... The character width used for tab characters. Default is `4`.
- `comments` ... The maximum line length for lines that contain only a comment. If omitted, comment lines use `code`.
- `ignorePattern` ... Ignores lines that match this regular expression.
- `ignoreComments` ... Ignores all comment lines and trailing comments. Default is `false`.
- `ignoreTrailingComments` ... Ignores only trailing comments. The rest of the line is still measured. Default is `false`.
- `ignoreUrls` ... Ignores lines that contain a URL. Default is `false`.
- `ignoreStrings` ... Ignores lines that contain a double-quoted or single-quoted scalar. Plain scalars and block scalars (`|`, `>`) are still checked. Default is `false`.

These options work like the [@stylistic/max-len] options with the same names. See [here](https://eslint.style/rules/max-len#options) for details.
The JavaScript-specific options `ignoreTemplateLiterals` and `ignoreRegExpLiterals` are not supported, and the options must be given as an object.

### `{ ignoreStrings: true }`

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/max-len: ['error', { ignoreStrings: true }]

# ✓ GOOD
quoted: "this quoted scalar makes the line longer than the default limit of eighty characters"

# ✗ BAD
plain: this plain scalar makes the line longer than the default limit of eighty characters
```

</eslint-code-block>

## :couple: Related rules

- [@stylistic/max-len]

[@stylistic/max-len]: https://eslint.style/rules/max-len

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/max-len.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/max-len.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/max-len)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/max-len)</sup>
