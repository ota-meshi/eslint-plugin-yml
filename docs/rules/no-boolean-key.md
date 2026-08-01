---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-boolean-key"
description: "disallow boolean mapping keys"
since: "v3.7.0"
---

# yml/no-boolean-key

> disallow boolean mapping keys

## :book: Rule Details

YAML resolves some plain scalars as booleans. When those values are used as
mapping keys, downstream processors can mishandle them, as reported in
[issue #280]. A common example is the `no:` "Norway problem," where a key
intended as text resolves to `false`.

This rule reports boolean mapping keys in any YAML document. Which plain
scalars resolve to booleans depends on the document's YAML version. YAML 1.1
additionally resolves the `y`/`yes`, `n`/`no`, `on`, and `off` families, while
the YAML 1.2 core schema resolves only `true`/`false` and the `True`/`TRUE` and
`False`/`FALSE` case variants.

<eslint-code-block>

<!-- eslint-skip -->

```yaml
# eslint yml/no-boolean-key: 'error'
%YAML 1.2
---

# ✓ GOOD
"true": value
!!str false: value

# ✗ BAD
true: value
false: value
...
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

You do not need this rule if your codebase intentionally allows boolean
mapping keys and downstream consumers handle them safely.

[issue #280]: https://github.com/ota-meshi/eslint-plugin-yml/issues/280

## :rocket: Version

This rule was introduced in eslint-plugin-yml v3.7.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-boolean-key.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-boolean-key.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/no-boolean-key)
