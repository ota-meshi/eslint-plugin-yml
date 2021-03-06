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

## :book: Usage

See [User Guide](./user-guide/README.md).

## :white_check_mark: Rules

See [Available Rules](./rules/README.md).

## :couple: Related Packages

- [eslint-plugin-jsonc](https://github.com/ota-meshi/eslint-plugin-jsonc) ... ESLint plugin for JSON, JSON with comments (JSONC) and JSON5.
- [eslint-plugin-toml](https://github.com/ota-meshi/eslint-plugin-toml) ... ESLint plugin for TOML.
- [eslint-plugin-json-schema-validator](https://github.com/ota-meshi/eslint-plugin-json-schema-validator) ... ESLint plugin that validates data using JSON Schema Validator.
- [jsonc-eslint-parser](https://github.com/ota-meshi/jsonc-eslint-parser) ... JSON, JSONC and JSON5 parser for use with ESLint plugins.
- [yaml-eslint-parser](https://github.com/ota-meshi/yaml-eslint-parser) ... YAML parser for use with ESLint plugins.
- [toml-eslint-parser](https://github.com/ota-meshi/toml-eslint-parser) ... TOML parser for use with ESLint plugins.

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[YAML]: https://yaml.org/
