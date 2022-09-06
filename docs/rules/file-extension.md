---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/file-extension"
description: "enforce YAML file extension"
---

# yml/file-extension

> enforce YAML file extension

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

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

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/file-extension.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/file-extension.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/file-extension)
