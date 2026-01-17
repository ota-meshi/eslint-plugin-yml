---
"eslint-plugin-yml": major
---

Convert package to ESM-only. The package now uses `"type": "module"` and only exports ESM modules. CommonJS `require()` is no longer supported. Users must use ES modules (`import`) to load this plugin.
