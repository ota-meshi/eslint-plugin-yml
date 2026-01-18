import { RuleTester } from "eslint";
import rule from "../../../src/rules/file-extension";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("file-extension", rule as any, {
  valid: [
    {
      filename: "test.yaml",
      code: "a: b",
    },
    {
      filename: "test.yml",
      code: "a: b",
      options: [{ extension: "yml" }],
    },
    {
      filename: "test.yaml",
      code: "a: b",
      options: [{ extension: "yaml" }],
    },
    {
      filename: "test.YAML",
      code: "a: b",
      options: [{ extension: "yaml", caseSensitive: false }],
    },
  ],
  invalid: [
    {
      filename: "test.yml",
      code: "a: b",
      errors: ["Expected extension '.yaml' but used extension '.yml'."],
    },
    {
      filename: "test.yaml",
      code: "a: b",
      options: [{ extension: "yml" }],
      errors: ["Expected extension '.yml' but used extension '.yaml'."],
    },
    {
      filename: "test.yml",
      code: "a: b",
      options: [{ extension: "yaml" }],
      errors: ["Expected extension '.yaml' but used extension '.yml'."],
    },
    {
      filename: "test.YAML",
      code: "a: b",
      options: [{ extension: "yaml" }],
      errors: ["Expected extension '.yaml' but used extension '.YAML'."],
    },
  ],
});
