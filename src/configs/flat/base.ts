import type { ESLint, Linter } from "eslint";
import * as parser from "yaml-eslint-parser";
export default [
  {
    plugins: {
      get yml(): ESLint.Plugin {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
        return require("../../index");
      },
    },
  },
  {
    files: ["*.yaml", "**/*.yaml", "*.yml", "**/*.yml"],
    languageOptions: {
      parser,
    },
    rules: {
      // ESLint core rules known to cause problems with YAML.
      "no-irregular-whitespace": "off",
      "no-unused-vars": "off",
      "spaced-comment": "off",
    },
  },
] satisfies Linter.FlatConfig[];
