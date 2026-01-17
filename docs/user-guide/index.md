# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-yml
```

::: tip Requirements

- ESLint v9.38.0 and above
- Node.js v20.19.0 or higher (in the 20.x line), v22.13.0 or higher (in the 22.x line), or v24.0.0 and above

:::

## :book: Usage

<!--USAGE_GUIDE_START-->

### Configuration

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import eslintPluginYml from 'eslint-plugin-yml';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginYml.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
    // 'yml/rule-name': 'error'
    }
  }
];
```

This plugin provides configs:

- `*.configs.base` ... Configuration to enable correct YAML parsing.
- `*.configs.recommended` ... Above, plus rules to prevent errors or unintended behavior.
- `*.configs.standard` ... Above, plus rules to enforce the common stylistic conventions.
- `*.configs.prettier` ... Turn off rules that may conflict with [Prettier](https://prettier.io/).

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

**Note:** The `*.configs['flat/*']` configs are still available for backward compatibility, but it is recommended to use the new config names without the `flat/` prefix.

#### Parser Configuration

If you have specified a parser, you need to configure a parser for `.yaml`.

For example, if you are using the `"@babel/eslint-parser"`, configure it as follows:

```js
import eslintPluginYml from 'eslint-plugin-yml';
import babelParser from '@babel/eslint-parser';

export default [
  ...eslintPluginYml.configs.standard,
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
    },
  },
  // YAML files are already configured by the plugin
];
```

#### Parser Options

The following parser options for `yaml-eslint-parser` are available by specifying them in [parserOptions](https://eslint.org/docs/latest/user-guide/configuring/language-options#specifying-parser-options) in the ESLint configuration file.

```js
import eslintPluginYml from 'eslint-plugin-yml';

export default [
  ...eslintPluginYml.configs.recommended,
  {
    files: ['**/*.yaml', '**/*.yml'],
    languageOptions: {
      parserOptions: {
        defaultYAMLVersion: '1.2',
      },
    },
  },
];
```

See also [https://github.com/ota-meshi/yaml-eslint-parser#readme](https://github.com/ota-meshi/yaml-eslint-parser#readme).

### Running ESLint from the command line

With ESLint v9 and flat config, ESLint automatically lints all files matched by your config. You typically don't need the `--ext` option anymore.

Examples:

```bash
eslint .
eslint "src/**/*.{js,yaml,yml}"
```

#### Languages

This plugin provides the following language identifiers for use in ESLint configurations:

- `yml/yaml` ... YAML files

For example, to apply settings specifically to YAML files, you can use the `language` field in your ESLint configuration:

```js
import eslintPluginYml from 'eslint-plugin-yml';
export default [
  {
    files: ["*.yaml", "*.yml", "**/*.yaml", "**/*.yml"],
    plugins: {
      yml: eslintPluginYml,
    },
    language: "yml/yaml",
  }
]
```

The configuration above is included in the shareable configs provided by this plugin, so using `configs` is generally recommended.

See also <https://eslint.org/docs/latest/use/configure/plugins#specify-a-language>

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
