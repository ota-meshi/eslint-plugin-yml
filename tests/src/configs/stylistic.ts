import assert from "assert";
import plugin from "../../../src/index";
import { LegacyESLint, ESLint } from "../../utils/eslint-compat";

const code = `foo:   42`;
describe("`stylistic` config", () => {
  it("legacy `stylistic` config should work. ", async () => {
    const linter = new LegacyESLint({
      plugins: {
        yml: plugin as never,
      },
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
        },
        extends: ["plugin:yml/recommended", "plugin:yml/stylistic"],
      },
      useEslintrc: false,
    });
    const result = await linter.lintText(code, { filePath: "test.yml" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [
        {
          message: "Expected extension '.yaml' but used extension '.yml'.",
          ruleId: "yml/file-extension",
          line: 1,
        },
      ]
    );
  });
  it("`flat/stylistic` config should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true as never,
      // @ts-expect-error -- typing bug
      overrideConfig: [
        ...(plugin.configs["flat/recommended"] as never),
        ...(plugin.configs["flat/stylistic"] as never),
      ],
    });
    const result = await linter.lintText(code, { filePath: "test.yml" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [
        {
          message: "Expected extension '.yaml' but used extension '.yml'.",
          ruleId: "yml/file-extension",
          line: 1,
        },
      ]
    );

    const resultWithJs = await linter.lintText(";", { filePath: "test.js" });
    const messagesWithJs = resultWithJs[0].messages;

    assert.deepStrictEqual(
      messagesWithJs.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      []
    );
  });
});
