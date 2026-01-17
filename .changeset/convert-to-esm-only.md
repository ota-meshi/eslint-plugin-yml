---
"eslint-plugin-yml": major
---

Convert package to ESM-only. The package now uses `"type": "module"` and only exports ESM modules. CommonJS `require()` is no longer supported. Users must use ES modules (`import`) to load this plugin.

Migration guide:
- Change from `const plugin = require('eslint-plugin-yml')` to `import plugin from 'eslint-plugin-yml'`
- Ensure your project supports ESM (either use `"type": "module"` in package.json or use `.mjs` file extensions)
- For TypeScript users, ensure `"module"` is set to a value that supports ESM (e.g., "ES2022", "ESNext", "NodeNext")
