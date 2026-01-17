import type { ESLint, Linter } from "eslint";
import * as parser from "yaml-eslint-parser";

let pluginCache: ESLint.Plugin | null = null;

export default [
  {
    plugins: {
      get yml(): ESLint.Plugin {
        if (!pluginCache) {
          // Dynamic import in ESM - this will be resolved synchronously
          // after the first module load
          pluginCache = (globalThis as any).__eslintPluginYml_instance;
          if (!pluginCache) {
            throw new Error(
              "ESLint Plugin YML: Plugin not properly initialized. " +
              "Please ensure you're using the plugin correctly."
            );
          }
        }
        return pluginCache;
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
