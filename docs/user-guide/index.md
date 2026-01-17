# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-yml
```

::: tip Requirements

- ESLint v6.0.0 and above
- Node.js v20.19.0 or higher (in the 20.x line), v22.13.0 or higher (in the 22.x line), or v24.0.0 and above

:::

## :book: Usage

<!--USAGE_GUIDE_START-->

### Configuration

#### New Config (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import eslintPluginYml from 'eslint-plugin-yml';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginYml.configs['flat/recommended'],
  {
    rules: {
      // override/add rules settings here, such as:
    // 'yml/rule-name': 'error'
    }
  }
];
```

This plugin provides configs:

- `*.configs['flat/base']` ... Configuration to enable correct YAML parsing.
- `*.configs['flat/recommended']` ... Above, plus rules to prevent errors or unintended behavior.
- `*.configs['flat/standard']` ... Above, plus rules to enforce the common stylistic conventions.
- `*.configs['flat/prettier']` ... Turn off rules that may conflict with [Prettier](https://prettier.io/).

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Use `.eslintrc.*` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/>.

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "plugin:yml/standard",
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'yml/rule-name': 'error'
  },
};
```

This plugin provides configs:

- `plugin:yml/base` ... Configuration to enable correct YAML parsing.
- `plugin:yml/recommended` ... Above, plus rules to prevent errors or unintended behavior.
- `plugin:yml/standard` ... Above, plus rules to enforce the common stylistic conventions.
- `plugin:yml/prettier` ... Turn off rules that may conflict with [Prettier](https://prettier.io/).

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

#### Parser Configuration

If you have specified a parser, you need to configure a parser for `.yaml`.

For example, if you are using the `"@babel/eslint-parser"`, configure it as follows:

```js
module.exports = {
  // ...
  extends: ["plugin:yml/standard"],
  // ...
  parser: "@babel/eslint-parser",
  // Add an `overrides` section to add a parser configuration for YAML.
  overrides: [
    {
      files: ["*.yaml", "*.yml"],
      parser: "yaml-eslint-parser",
    },
  ],
  // ...
};
```

#### Parser Options

The following parser options for `yaml-eslint-parser` are available by specifying them in [parserOptions](https://eslint.org/docs/latest/user-guide/configuring/language-options#specifying-parser-options) in the ESLint configuration file.

```js
module.exports = {
  // ...
  overrides: [
    {
      files: ["*.yaml", "*.yml"],
      parser: "yaml-eslint-parser",
      // Options used with yaml-eslint-parser.
      parserOptions: {
        defaultYAMLVersion: "1.2",
      },
    },
  ],
  // ...
};
```

See also [https://github.com/ota-meshi/yaml-eslint-parser#readme](https://github.com/ota-meshi/yaml-eslint-parser#readme).

### Running ESLint from the command line

If you want to run `eslint` from the command line, make sure you include the `.yaml` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern, because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.yaml,.yml src
eslint "src/**/*.{js,yaml,yml}"
```

## :computer: Editor Integrations

### Visual Studio Code

Use the [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `eslint.validate` option of the extension to check `.yaml` files, because the extension targets only `*.js` or `*.jsx` files by default.

Example **.vscode/settings.json**:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "yaml",
    "github-actions-workflow" // for GitHub Actions workflow files
  ]
}
```

### JetBrains WebStorm IDEs

In any of the JetBrains IDEs you can [configure the linting scope](https://www.jetbrains.com/help/webstorm/eslint.html#ws_eslint_configure_scope).
Following the steps in their help document, you can add YAML files to the scope like so:

1. Open the **Settings/Preferences** dialog, go to **Languages and Frameworks** | **JavaScript** | **Code Quality Tools** | **ESLint**, and select **Automatic ESLint configuration** or **Manual ESLint configuration**.
2. In the **Run for files** field, update the pattern that defines the set of files to be linted to include YAML files as well:

```
{**/*,*}.{js,ts,jsx,tsx,html,vue,yaml,yml}
                                 ^^^^ ^^^
```

<!--USAGE_GUIDE_END-->

## :question: FAQ

- TODO
