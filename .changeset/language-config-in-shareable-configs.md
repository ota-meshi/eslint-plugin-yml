---
"eslint-plugin-yml": major
---

Use language config in shareable configs. The shareable configs now use the new ESLint v9 language config API (`language: "yml/yaml"`) instead of the legacy parser approach (`languageOptions: { parser }`). This is a breaking change that aligns with ESLint's language plugin architecture.
