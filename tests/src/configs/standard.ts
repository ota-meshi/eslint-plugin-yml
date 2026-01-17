import assert from "assert";
import plugin from "../../../src/index";
import { ESLint } from "../../utils/eslint-compat";

const code = `foo:   42`;
describe("`standard` config", () => {
  it("`standard` config should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true as never,
      // @ts-expect-error -- typing bug
      overrideConfig: [
        ...(plugin.configs.recommended as never),
        ...(plugin.configs.standard as never),
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

    const resultWithJs = await linter.lintText(";", { filePath: "test.js" });
    const messagesWithJs = resultWithJs[0].messages;

    assert.deepStrictEqual(
      messagesWithJs.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });
  it("`flat/standard` config should work (backward compatibility). ", async () => {
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

    const resultWithJs = await linter.lintText(";", { filePath: "test.js" });
    const messagesWithJs = resultWithJs[0].messages;

    assert.deepStrictEqual(
      messagesWithJs.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });
});
