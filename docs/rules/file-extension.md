---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/file-extension"
description: "enforce YAML file extension"
since: "v1.2.0"
---

# yml/file-extension

> enforce YAML file extension

- :gear: This rule is included in `"plugin:yml/stylistic"`.

## :book: Rule Details

This rule aims to enforce YAML file extension.

<eslint-code-block file-name="example.yaml">

<!-- eslint-skip -->

```yaml
# ✓ GOOD
# filename is `example.yaml`

# eslint yml/file-extension: 'error'
```

</eslint-code-block>

<eslint-code-block file-name="example.yaml">

<!-- eslint-skip -->

```yaml
# ✗ BAD
# filename is `example.yml`

# eslint yml/file-extension: 'error'
```

</eslint-code-block>

## :wrench: Options

```yaml
yml/file-extension:
  - error
  - extension: yaml # or 'yml'
    caseSensitive: true
```

- `extension` ... The extension you want to enforce. Default is `"yaml"`.
- `caseSensitive` ... Specify `true` to enforce lowercase extension. Default is `true`.

## :rocket: Version

This rule was introduced in eslint-plugin-yml v1.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/file-extension.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/file-extension.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/file-extension)
