import path from "path";
import assert from "assert";
import { ESLint } from "./eslint-compat";
import plugin from "../../src/index";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-yml", () => {
  it("should lint without errors", async () => {
    const engine = new ESLint({
      cwd: TEST_CWD,
      extensions: [".js", ".yml"],
      plugins: { "eslint-plugin-yml": plugin as any },
    });
    const results = await engine.lintFiles(["test01/src"]);
    assert.strictEqual(results.length, 2);
    assert.strictEqual(
      results.reduce((s, a) => s + a.errorCount, 0),
      0
    );
  });

  // https://github.com/ota-meshi/eslint-plugin-yml/issues/89
  it("should lint without error when use the 'no-multi-spaces' rule and block node together.", async () => {
    const engine = new ESLint({
      cwd: TEST_CWD,
      extensions: [".yml"],
      plugins: { "eslint-plugin-yml": plugin as any },
    });
    const results = await engine.lintFiles(["issue89/src"]);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(
      results.reduce((s, a) => s + a.errorCount, 0),
      0
    );
  });
});
