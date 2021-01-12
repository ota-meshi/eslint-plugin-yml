---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-irregular-whitespace"
description: "disallow irregular whitespace"
---
# yml/no-irregular-whitespace

> disallow irregular whitespace

- :gear: This rule is included in `"plugin:yml/recommended"` and `"plugin:yml/standard"`.

## :book: Rule Details

`yml/no-irregular-whitespace` rule is aimed at catching invalid whitespace that is not a normal tab and space. Some of these characters may cause issues in YAML parsers and others will be a debugging issue to spot.
`yml/no-irregular-whitespace` rule is the similar rule as core [no-irregular-whitespace] rule but it applies to the source code in YAML.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/no-irregular-whitespace: 'error'

# ✓ GOOD
a: b

# ✗ BAD
c: d
#  ^ LINE TABULATION (U+000B)
```

</eslint-code-block>

## :wrench: Options

```yaml
"yml/no-irregular-whitespace":
  - error
  - skipQuotedScalars: true
    skipComments: false
```

- `skipQuotedScalars` ... if `true`, allows any whitespace characters in quoted scalars. default `true`
- `skipComments` ... if `true`, allows any whitespace characters in comments. default `false`

### `"skipQuotedScalars": true` (default)

<eslint-code-block>

<!-- eslint-skip -->

```yml
# eslint yml/no-irregular-whitespace: [error, {skipQuotedScalars: true}]
# ✓ GOOD
- 'foo'
#  ^ LINE TABULATION (U+000B)
- "bar"
#  ^ LINE TABULATION (U+000B)
```

</eslint-code-block>

### `"skipQuotedScalars": false`

<eslint-code-block>

<!-- eslint-skip -->

```yml
# eslint yml/no-irregular-whitespace: [error, {skipQuotedScalars: false}]
# ✗ BAD
- 'foo'
#  ^ LINE TABULATION (U+000B)
- "bar"
#  ^ LINE TABULATION (U+000B)
```

</eslint-code-block>

### `"skipComments": true`

<eslint-code-block>

<!-- eslint-skip -->

```yml
# eslint yml/no-irregular-whitespace: [error, {skipComments: true}]
# ✓ GOOD
# []< LINE TABULATION (U+000B)
```

</eslint-code-block>

## :couple: Related rules

- [no-irregular-whitespace]

[no-irregular-whitespace]: https://eslint.org/docs/rules/no-irregular-whitespace

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-irregular-whitespace.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-irregular-whitespace.js)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-irregular-whitespace)</sup>
