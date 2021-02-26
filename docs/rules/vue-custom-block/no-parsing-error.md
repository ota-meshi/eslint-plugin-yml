---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/vue-custom-block/no-parsing-error"
description: "disallow parsing errors in Vue custom blocks"
since: "v0.2.0"
---
# yml/vue-custom-block/no-parsing-error

> disallow parsing errors in Vue custom blocks

- :gear: This rule is included in `"plugin:yml/recommended"` and `"plugin:yml/standard"`.

## :book: Rule Details

This rule reports YAML parsing errors in Vue custom blocks.

<eslint-code-block parser="vue-eslint-parser" file-name="sample.vue" language="html">

<!-- eslint-skip -->

```vue
<i18n lang="yaml">
{ "foo":
</i18n>

<my-block lang="yml">
{ "foo":
</my-block>

<script>
/* eslint yml/vue-custom-block/no-parsing-error: 'error' */
</script>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-yml v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/vue-custom-block/no-parsing-error.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/vue-custom-block/no-parsing-error.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-yml/tree/master/tests/fixtures/rules/vue-custom-block/no-parsing-error)
