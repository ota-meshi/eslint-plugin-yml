---
pageClass: "rule-details"
sidebarDepth: 0
title: "yml/vue-custom-block/no-parsing-error"
description: "disallow parsing errors in Vue custom blocks"
---
# yml/vue-custom-block/no-parsing-error

> disallow parsing errors in Vue custom blocks

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
/* eslint yml/vue-custom-block/no-parsing-error: 'error' */
</script>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/src/rules/vue-custom-block/no-parsing-error.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-yml/blob/master/tests/src/rules/vue-custom-block/no-parsing-error.js)
