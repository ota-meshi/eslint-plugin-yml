---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/no-parsing-error-in-vue-custom-block"
description: "disallow parsing errors in vue custom blocks"
---
# yml/no-parsing-error-in-vue-custom-block

> disallow parsing errors in vue custom blocks

- :gear: This rule is included in `"plugin:yml/recommended"`.

## :book: Rule Details

This rule reports YAML parsing errors in Vue custom blocks.

<eslint-code-block parser="vue-eslint-parser" file-name="sample.vue" language="html">

```vue
<i18n lang="yaml">
{ "foo":
</i18n>

<my-block lang="yml">
{ "foo":
</my-block>

<script>
/* eslint yml/no-parsing-error-in-vue-custom-block: 'error' */
</script>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/no-parsing-error-in-vue-custom-block.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/no-parsing-error-in-vue-custom-block.js)
