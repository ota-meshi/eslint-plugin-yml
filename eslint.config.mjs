import myPlugin from "@ota-meshi/eslint-plugin";

export default [
  {
    ignores: [
      ".nyc_output/",
      "coverage/",
      "node_modules/",
      "tests/fixtures/integrations/",
      "tests/fixtures/**/*.vue",
      "tests/fixtures/**/*.yaml",
      "tests/fixtures/**/*.yml",
      "assets/",
      "dist/",
      "lib/",
      "!.github/",
      "!.vscode/",
      "!.devcontainer/",
      "!docs/.vuepress/",
      "!docs/.vitepress/",
      "docs/.vuepress/dist/",
      "docs/.vuepress/components/demo/demo-code.js",
      "docs/.vitepress/cache/",
      "docs/.vitepress/build-system/shim/",
      "docs/.vitepress/dist/",
      "**/*.md/*.bash",
    ],
  },
  ...myPlugin.config({
    node: true,
    ts: true,
    eslintPlugin: true,
    vue3: true,
    packageJson: true,
    json: true,
    yaml: true,
    md: true,
    prettier: true,
  }),
  {
    languageOptions: {
      sourceType: "script",
      parserOptions: {
        projectService: true,
      },
    },

    rules: {
      "no-warning-comments": "warn",
      "no-lonely-if": "off",
      "new-cap": "off",
      "no-shadow": "off",

      "no-void": [
        "error",
        {
          allowAsStatement: true,
        },
      ],

      "jsonc/array-element-newline": "off",

      "no-restricted-properties": [
        "error",
        {
          object: "context",
          property: "getSourceCode",
        },
        {
          object: "context",
          property: "getFilename",
        },
        {
          object: "context",
          property: "getCwd",
        },
        {
          object: "context",
          property: "getScope",
        },
        {
          object: "context",
          property: "parserServices",
        },
      ],
    },
  },
  {
    files: ["**/*.mjs", "*.mjs"],

    languageOptions: {
      sourceType: "module",
    },
  },
  {
    files: ["**/*.ts", "**/*.mts"],

    languageOptions: {
      sourceType: "module",
      parserOptions: {},
    },

    rules: {
      "n/no-unsupported-features/es-syntax": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "property",
          format: null,
        },
        {
          selector: "method",
          format: null,
        },
        {
          selector: "import",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
      ],

      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: ["scripts/**/*.ts", "tests/**/*.ts"],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "no-console": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  {
    files: ["**/*.vue"],

    languageOptions: {
      globals: {
        require: true,
      },
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  {
    files: ["*.md/*.js", "**/*.md/*.js"],
    languageOptions: {
      sourceType: "module",
    },

    rules: {
      "n/no-missing-import": "off",
    },
  },
  {
    files: ["docs/.vitepress/**/*.{js,ts,mjs,mts,vue}"],
    languageOptions: {
      globals: {
        window: true,
      },
      sourceType: "module",
    },
    rules: {
      "jsdoc/require-jsdoc": "off",
      "n/file-extension-in-import": "off",
      "n/no-extraneous-import": "off",
      "eslint-plugin/require-meta-docs-description": "off",
      "eslint-plugin/require-meta-docs-url": "off",
      "eslint-plugin/require-meta-type": "off",
      "eslint-plugin/prefer-message-ids": "off",
      "eslint-plugin/prefer-object-rule": "off",
      "eslint-plugin/require-meta-schema": "off",
    },
  },
];
