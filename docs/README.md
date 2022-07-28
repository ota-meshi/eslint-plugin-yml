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

## :name_badge: Features

This ESLint plugin provides linting rules for [YAML].

- You can use ESLint to lint [YAML].
- You can find out the problem with your [YAML] files.
- You can apply consistent code styles to your [YAML] files.
- Supports [Vue SFC](https://vue-loader.vuejs.org/spec.html) custom blocks such as `<i18n lang="yaml">`.  
  Requirements `vue-eslint-parser` v7.3.0 and above.
- Supports ESLint directives. e.g. `# eslint-disable-next-line`
- You can check your code in real-time using the ESLint editor integrations.

You can check on the [Online DEMO](./playground/).

## :question: How is it different from other YAML plugins?

### Plugins that do not use AST

e.g. [eslint-plugin-yaml](https://www.npmjs.com/package/eslint-plugin-yaml)

These plugins use the processor to parse and return the results independently, without providing the ESLint engine with AST and source code text.

Plugins don't provide AST, so you can't use directive comments (e.g. `# eslint-disable`).  
Plugins don't provide source code text, so you can't use it with plugins and rules that use text (e.g. [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier), [eol-last](https://eslint.org/docs/rules/eol-last)).

**eslint-plugin-yml** works by providing AST and source code text to ESLint.

## :book: Usage

See [User Guide](./user-guide/README.md).

## :white_check_mark: Rules

See [Available Rules](./rules/README.md).

## :rocket: To Do More Verification

### Verify using JSON Schema

You can verify using JSON Schema by checking and installing [eslint-plugin-json-schema-validator].

### Verify the [Vue I18n] message resource files

You can verify the message files by checking and installing [@intlify/eslint-plugin-vue-i18n].

## :couple: Related Packages

- [eslint-plugin-jsonc](https://github.com/ota-meshi/eslint-plugin-jsonc) ... ESLint plugin for JSON, JSON with comments (JSONC) and JSON5.
- [eslint-plugin-toml](https://github.com/ota-meshi/eslint-plugin-toml) ... ESLint plugin for TOML.
- [eslint-plugin-json-schema-validator](https://github.com/ota-meshi/eslint-plugin-json-schema-validator) ... ESLint plugin that validates data using JSON Schema Validator.
- [jsonc-eslint-parser](https://github.com/ota-meshi/jsonc-eslint-parser) ... JSON, JSONC and JSON5 parser for use with ESLint plugins.
- [yaml-eslint-parser](https://github.com/ota-meshi/yaml-eslint-parser) ... YAML parser for use with ESLint plugins.
- [toml-eslint-parser](https://github.com/ota-meshi/toml-eslint-parser) ... TOML parser for use with ESLint plugins.

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[yaml]: https://yaml.org/
[eslint-plugin-json-schema-validator]: https://github.com/ota-meshi/eslint-plugin-json-schema-validator
[@intlify/eslint-plugin-vue-i18n]: https://github.com/intlify/eslint-plugin-vue-i18n
[vue i18n]: https://github.com/intlify/vue-i18n-next
