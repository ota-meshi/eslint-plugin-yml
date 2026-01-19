import type { ESLint, Linter } from "eslint";
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
    language: "yml/yaml",
    rules: {
      // ESLint core rules known to cause problems with YAML.
      "no-irregular-whitespace": "off",
      "no-unused-vars": "off",
      "spaced-comment": "off",
    },
  },
] satisfies Linter.Config[];
