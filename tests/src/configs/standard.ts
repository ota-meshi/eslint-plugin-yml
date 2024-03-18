import assert from "assert";
import plugin from "../../../src/index";
import { LegacyESLint, ESLint } from "../../utils/eslint-compat";

const code = `foo:   42`;
describe("`standard` config", () => {
  it("legacy `standard` config should work. ", async () => {
    const linter = new LegacyESLint({
      plugins: {
        yml: plugin as never,
      },
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
        },
        extends: ["plugin:yml/recommended", "plugin:yml/standard"],
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
          message: "Extra space before value for key 'foo'.",
          ruleId: "yml/key-spacing",
          line: 1,
        },
      ],
    );
  });
  it("`flat/standard` config should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true as never,
      // @ts-expect-error -- typing bug
      overrideConfig: [
        ...(plugin.configs["flat/recommended"] as never),
        ...(plugin.configs["flat/standard"] as never),
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
          message: "Extra space before value for key 'foo'.",
          ruleId: "yml/key-spacing",
          line: 1,
        },
      ],
    );
  });
});
