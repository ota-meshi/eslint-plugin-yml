---
"eslint-plugin-yml": major
---

Drop support for legacy ESLint config format. The plugin now exports flat configuration as the main configuration format.

**Breaking Changes:**
- Legacy ESLint config format (`.eslintrc.*`) is no longer supported
- The main config exports (`configs.base`, `configs.recommended`, `configs.standard`, `configs.prettier`) now use flat config format
- The `flat/*` namespace configs are kept for backward compatibility and point to the same flat configs

**Migration Guide:**

If you were using the legacy config format:
```js
// Old (.eslintrc.js)
module.exports = {
  extends: ["plugin:yml/standard"],
};
```

Update to flat config:
```js
// New (eslint.config.js)
import eslintPluginYml from 'eslint-plugin-yml';
export default [
  ...eslintPluginYml.configs.standard,
];
```

If you were using the `flat/*` namespace:
```js
// Old
import eslintPluginYml from 'eslint-plugin-yml';
export default [
  ...eslintPluginYml.configs['flat/recommended'],
];
```

You can keep using it (backward compatible) or update to the new format:
```js
// New (recommended)
import eslintPluginYml from 'eslint-plugin-yml';
export default [
  ...eslintPluginYml.configs.recommended,
];
```
