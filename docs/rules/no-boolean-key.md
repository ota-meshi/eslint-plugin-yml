---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-boolean-key"
description: "disallow boolean mapping keys"
---

# yml/no-boolean-key

> disallow boolean mapping keys

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

YAML 1.1 resolves several plain scalars, including `yes`, `no`, `on`, and
`off`, as booleans. When those values are used as mapping keys, downstream
processors can mishandle them, as reported in [issue #280]. A common example
is the `no:` "Norway problem," where a key intended as text resolves to
`false`.

This rule reports boolean mapping keys in YAML 1.1 documents.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/no-boolean-key: 'error'
%YAML 1.1
---

# ✓ GOOD
"no": Norway
!!str yes: value

# ✗ BAD
no: Norway
yes: value
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :warning: When Not To Use It

You do not need this rule if your codebase only uses YAML 1.2 documents.

[issue #280]: https://github.com/ota-meshi/eslint-plugin-yml/issues/280

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-boolean-key.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-boolean-key.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-boolean-key)
