import assert from "node:assert";
import plugin from "../../../src/index.ts";
import { ESLint } from "eslint";

const code = `b: 1
a: 2
`;
describe("`stylistic` config", () => {
  it("`stylistic` config should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        ...plugin.configs.recommended,
        ...plugin.configs.stylistic,
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
        {
          message:
            "Expected mapping keys to be in ascending order. 'b' should be after 'a'.",
          ruleId: "yml/sort-keys",
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
