# Introduction

[eslint-plugin-yml](https://www.npmjs.com/package/eslint-plugin-yml) is ESLint plugin provides linting rules for [YAML].

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-yml.svg)](https://www.npmjs.com/package/eslint-plugin-yml)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-yml.svg)](https://www.npmjs.com/package/eslint-plugin-yml)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-yml&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-yml)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-yml.svg)](http://www.npmtrends.com/eslint-plugin-yml)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-yml.svg)](http://www.npmtrends.com/eslint-plugin-yml)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-yml.svg)](http://www.npmtrends.com/eslint-plugin-yml)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-yml.svg)](http://www.npmtrends.com/eslint-plugin-yml)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-yml/workflows/CI/badge.svg?branch=master)](https://github.com/ota-meshi/eslint-plugin-yml/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-yml/badge.svg?branch=master)](https://coveralls.io/github/ota-meshi/eslint-plugin-yml?branch=master)

## Features

This ESLint plugin provides linting rules for [YAML].

- You can use ESLint to lint [YAML].
- You can find out the problem with your [YAML] files.
- Supports [Vue SFC](https://vue-loader.vuejs.org/spec.html) custom blocks such as `<i18n lang="yaml">`.
- Supports ESLint directives. e.g. `# eslint-disable-next-line`
- You can check your code in real-time using the ESLint editor integrations.

You can check on the [Online DEMO](https://ota-meshi.github.io/eslint-plugin-yml/playground/).

<!--DOCS_IGNORE_START-->

## Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-yml/).

## Installation

```bash
npm install --save-dev eslint eslint-plugin-yml
```

> **Requirements**
> 
> - ESLint v6.0.0 and above
> - Node.js v8.10.0 and above

<!--DOCS_IGNORE_END-->

## Usage

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

### Configuration

Use `.eslintrc.*` file to configure rules. See also: [https://eslint.org/docs/user-guide/configuring](https://eslint.org/docs/user-guide/configuring).

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:yml/recommended'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'yml/rule-name': 'error'
  }
}
```

This plugin provides configs:

- `plugin:yml/base` ... Configuration to enable correct YAML parsing.
- `plugin:yml/recommended` ... Recommended configuration.

See [the rule list](https://ota-meshi.github.io/eslint-plugin-yml/rules/) to get the `rules` that this plugin provides.

### Running ESLint from the command line

If you want to run `eslint` from the command line, make sure you include the `.yaml` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern, because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.yaml,.yml src
eslint "src/**/*.{js,yaml,yml}"
```

## Editor Integrations

### Visual Studio Code

Use the [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `eslint.validate` option of the extension to check `.yaml` files, because the extension targets only `*.js` or `*.jsx` files by default.

Example **.vscode/settings.json**:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "yaml"
  ]
}
```

<!--USAGE_GUIDE_END-->
<!--USAGE_SECTION_END-->

## Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.  
The rules with the following star :star: are included in the config.

<!--RULES_TABLE_START-->

### YAML Rules

| Rule ID | Description | Fixable | RECOMMENDED |
|:--------|:------------|:-------:|:-----------:|
| [yml/block-mapping](https://ota-meshi.github.io/eslint-plugin-yml/rules/block-mapping.html) | require or disallow block style mappings. | :wrench: |  |
| [yml/block-sequence](https://ota-meshi.github.io/eslint-plugin-yml/rules/block-sequence.html) | require or disallow block style sequences. | :wrench: |  |
| [yml/indent](https://ota-meshi.github.io/eslint-plugin-yml/rules/indent.html) | enforce consistent indentation | :wrench: |  |
| [yml/key-name-casing](https://ota-meshi.github.io/eslint-plugin-yml/rules/key-name-casing.html) | enforce naming convention to key names |  |  |
| [yml/no-tab-indent](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-tab-indent.html) | disallow tabs for indentation. |  | :star: |
| [yml/vue-custom-block/no-parsing-error](https://ota-meshi.github.io/eslint-plugin-yml/rules/vue-custom-block/no-parsing-error.html) | disallow parsing errors in Vue custom blocks |  | :star: |

### Extension Rules

| Rule ID | Description | Fixable | RECOMMENDED |
|:--------|:------------|:-------:|:-----------:|
| [yml/flow-mapping-curly-newline](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-mapping-curly-newline.html) | enforce consistent line breaks inside braces | :wrench: |  |
| [yml/flow-mapping-curly-spacing](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-mapping-curly-spacing.html) | enforce consistent spacing inside braces | :wrench: |  |
| [yml/flow-sequence-bracket-newline](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-sequence-bracket-newline.html) | enforce linebreaks after opening and before closing flow sequence brackets | :wrench: |  |
| [yml/flow-sequence-bracket-spacing](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-sequence-bracket-spacing.html) | enforce consistent spacing inside flow sequence brackets | :wrench: |  |
| [yml/no-irregular-whitespace](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-irregular-whitespace.html) | disallow irregular whitespace |  | :star: |
| [yml/spaced-comment](https://ota-meshi.github.io/eslint-plugin-yml/rules/spaced-comment.html) | enforce consistent spacing after the `#` in a comment | :wrench: |  |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

<!--DOCS_IGNORE_START-->

## Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

<!--DOCS_IGNORE_END-->

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[YAML]: https://yaml.org/
