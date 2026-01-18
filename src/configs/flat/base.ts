import type { ESLint, Linter } from "eslint";
import * as parser from "yaml-eslint-parser";
import plugin from "../../index.js";

export default [
  {
    plugins: {
      get yml(): ESLint.Plugin {
        // Delayed reference to avoid circular dependency
        return plugin;
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
] satisfies Linter.Config[];
