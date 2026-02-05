import assert from "node:assert";
import plugin from "../../../src/index.ts";
import { ESLint } from "eslint";

const code = `foo: bar`;

describe("`base` config", () => {
  it("`base` config should work with language config", async () => {
    const linter = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [...plugin.configs.base],
    });
    const result = await linter.lintText(code, { filePath: "test.yml" });
    const messages = result[0].messages;

    // Should successfully parse YAML without errors
    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });

  it("`base` config should use language config instead of parser", () => {
    const baseConfig = plugin.configs.base;

    // Find the config object that has files and language settings
    const yamlConfig = baseConfig.find(
      (config) =>
        Array.isArray(config.files) &&
        config.files.some(
          (f: string) =>
            f === "*.yml" ||
            f === "*.yaml" ||
            f === "**/*.yml" ||
            f === "**/*.yaml",
        ),
    );

    assert.ok(yamlConfig, "Should have a config for YAML files");
    assert.strictEqual(
      yamlConfig.language,
      "yml/yaml",
      "Should use language config 'yml/yaml'",
    );
    assert.strictEqual(
      yamlConfig.languageOptions,
      undefined,
      "Should not have languageOptions.parser (legacy approach)",
    );
  });

  it("`flat/base` config should work (backward compatibility)", async () => {
    const linter = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [...plugin.configs["flat/base"]],
    });
    const result = await linter.lintText(code, { filePath: "test.yml" });
    const messages = result[0].messages;

    // Should successfully parse YAML without errors
    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });
});
