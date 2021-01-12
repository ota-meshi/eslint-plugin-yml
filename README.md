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
- You can apply consistent code styles to your [YAML] files.
- Supports [Vue SFC](https://vue-loader.vuejs.org/spec.html) custom blocks such as `<i18n lang="yaml">`.  
  Requirements `vue-eslint-parser` v7.3.0 and above.
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
    'plugin:yml/standard'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'yml/rule-name': 'error'
  }
}
```

This plugin provides configs:

- `plugin:yml/base` ... Configuration to enable correct YAML parsing.
- `plugin:yml/recommended` ... Above, plus rules to prevent errors or unintended behavior.
- `plugin:yml/standard` ... Above, plus rules to enforce the common stylistic conventions.

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

| Rule ID | Description | Fixable | RECOMMENDED | STANDARD |
|:--------|:------------|:-------:|:-----------:|:--------:|
| [yml/block-mapping-question-indicator-newline](https://ota-meshi.github.io/eslint-plugin-yml/rules/block-mapping-question-indicator-newline.html) | enforce consistent line breaks after `?` indicator | :wrench: |  | :star: |
| [yml/block-mapping](https://ota-meshi.github.io/eslint-plugin-yml/rules/block-mapping.html) | require or disallow block style mappings. | :wrench: |  | :star: |
| [yml/block-sequence-hyphen-indicator-newline](https://ota-meshi.github.io/eslint-plugin-yml/rules/block-sequence-hyphen-indicator-newline.html) | enforce consistent line breaks after `-` indicator | :wrench: |  | :star: |
| [yml/block-sequence](https://ota-meshi.github.io/eslint-plugin-yml/rules/block-sequence.html) | require or disallow block style sequences. | :wrench: |  | :star: |
| [yml/indent](https://ota-meshi.github.io/eslint-plugin-yml/rules/indent.html) | enforce consistent indentation | :wrench: |  | :star: |
| [yml/key-name-casing](https://ota-meshi.github.io/eslint-plugin-yml/rules/key-name-casing.html) | enforce naming convention to key names |  |  |  |
| [yml/no-empty-document](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-document.html) | disallow empty document |  | :star: | :star: |
| [yml/no-empty-key](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-key.html) | disallow empty mapping keys |  | :star: | :star: |
| [yml/no-empty-mapping-value](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-mapping-value.html) | disallow empty mapping values |  | :star: | :star: |
| [yml/no-empty-sequence-entry](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-sequence-entry.html) | disallow empty sequence entries |  | :star: | :star: |
| [yml/no-tab-indent](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-tab-indent.html) | disallow tabs for indentation. |  | :star: | :star: |
| [yml/plain-scalar](https://ota-meshi.github.io/eslint-plugin-yml/rules/plain-scalar.html) | require or disallow plain style scalar. | :wrench: |  | :star: |
| [yml/quotes](https://ota-meshi.github.io/eslint-plugin-yml/rules/quotes.html) | enforce the consistent use of either double, or single quotes | :wrench: |  | :star: |
| [yml/require-string-key](https://ota-meshi.github.io/eslint-plugin-yml/rules/require-string-key.html) | disallow mapping keys other than strings |  |  |  |
| [yml/vue-custom-block/no-parsing-error](https://ota-meshi.github.io/eslint-plugin-yml/rules/vue-custom-block/no-parsing-error.html) | disallow parsing errors in Vue custom blocks |  | :star: | :star: |

### Extension Rules

| Rule ID | Description | Fixable | RECOMMENDED | STANDARD |
|:--------|:------------|:-------:|:-----------:|:--------:|
| [yml/flow-mapping-curly-newline](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-mapping-curly-newline.html) | enforce consistent line breaks inside braces | :wrench: |  | :star: |
| [yml/flow-mapping-curly-spacing](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-mapping-curly-spacing.html) | enforce consistent spacing inside braces | :wrench: |  | :star: |
| [yml/flow-sequence-bracket-newline](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-sequence-bracket-newline.html) | enforce linebreaks after opening and before closing flow sequence brackets | :wrench: |  | :star: |
| [yml/flow-sequence-bracket-spacing](https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-sequence-bracket-spacing.html) | enforce consistent spacing inside flow sequence brackets | :wrench: |  | :star: |
| [yml/key-spacing](https://ota-meshi.github.io/eslint-plugin-yml/rules/key-spacing.html) | enforce consistent spacing between keys and values in mapping pairs | :wrench: |  | :star: |
| [yml/no-irregular-whitespace](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-irregular-whitespace.html) | disallow irregular whitespace |  | :star: | :star: |
| [yml/sort-keys](https://ota-meshi.github.io/eslint-plugin-yml/rules/sort-keys.html) | require mapping keys to be sorted | :wrench: |  |  |
| [yml/spaced-comment](https://ota-meshi.github.io/eslint-plugin-yml/rules/spaced-comment.html) | enforce consistent spacing after the `#` in a comment | :wrench: |  | :star: |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

<!--DOCS_IGNORE_START-->

## Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

### Working With Rules

This plugin uses [yaml-eslint-parser](https://github.com/ota-meshi/yaml-eslint-parser) for the parser. Check [here](https://ota-meshi.github.io/yaml-eslint-parser/) to find out about AST.

<!--DOCS_IGNORE_END-->

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[YAML]: https://yaml.org/
