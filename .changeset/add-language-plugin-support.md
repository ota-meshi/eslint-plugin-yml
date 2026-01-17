---
"eslint-plugin-yml": minor
---

feat: add ESLint language plugin support

This change adds native ESLint language plugin support to eslint-plugin-yml. The plugin now exports a `languages` object containing a `yaml` language implementation that integrates with ESLint's new language API.

Key additions:
- `YAMLLanguage` class implementing the ESLint `Language` interface
- `YAMLSourceCode` class for managing YAML source code
- `TokenStore` helper for efficient token manipulation
- Export of `languages` object with YAML language support

This enhancement follows the same pattern as eslint-plugin-toml and provides better integration with ESLint's native language support features.
