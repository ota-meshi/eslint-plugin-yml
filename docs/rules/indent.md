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
  - indentBlockSequences: true
    indicatorValueIndent: 2
    alignMultilineFlowScalars: false
```

- Number option ... Specify the number of indents.
- Object option
  - `indentBlockSequences` ... Specifies whether block sequences should be indented or not (when in a mapping).
  - `indicatorValueIndent` ... Specifies the number of indents from indicator marks. Defaults to specified indent.
  - `alignMultilineFlowScalars` ... Specifies whether to align multiline flow scalars or not. Defaults to `false`.

### `"indentBlockSequences": true` (default)

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/indent: [error, 2, { indentBlockSequences: true }]

# ✓ GOOD
key1:
  - a
  - b
  - c

# ✗ BAD
key2:
- a
- b
- c
```

</eslint-code-block>

### `"indentBlockSequences": false`

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/indent: [error, 2, { indentBlockSequences: false }]

# ✓ GOOD
key1:
- a
- b
- c

# ✗ BAD
key2:
  - a
  - b
  - c
```

</eslint-code-block>

### `[4, "indicatorValueIndent": 2]`

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/indent: [error, 4, { indicatorValueIndent: 2 }]

# ✓ GOOD
good:
    key:
        - id: 1
          name: Foo
        - id: 2
          name: Bar
        - id: 3
          name: Baz

# ✗ BAD
bad:
    key:
        -   id: 1
            name: Foo
        -   id: 2
            name: Bar
        -   id: 3
            name: Baz
```

</eslint-code-block>

### `[2, "alignMultilineFlowScalars": true]`

<eslint-code-block fix>

<!-- eslint-skip -->

```yaml
# eslint yml/indent: [error, 2, { alignMultilineFlowScalars: true }]

# ✓ GOOD
good:
  key: a
       b
       c

# ✗ BAD
bad:
  key: a
    b
    c
```

</eslint-code-block>

## :couple: Related rules

- [indent]

[indent]: https://eslint.org/docs/rules/indent

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/indent.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/indent.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/indent)
