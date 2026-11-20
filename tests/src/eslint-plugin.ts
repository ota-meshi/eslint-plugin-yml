import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert";
import { ESLint } from "eslint";
import { setPlugin } from "../fixtures/integrations/eslint-plugin/plugin-store.cjs";
import semver from "semver";
import plugin from "../../src/index.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));
// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

setPlugin(plugin);

const TEST_ROOT = path.join(dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-yml", () => {
  describe("should lint without errors", () => {
    if (!semver.satisfies(ESLint.version, ">=8")) return;
    for (const { dir, expects } of [
      {
        dir: "test01",
        expects: {
          files: 2,
          errors: 0,
        },
      },
      ...(semver.satisfies(process.version, ">=18") &&
      semver.satisfies(ESLint.version, ">=9")
        ? [
            {
              dir: "with-json",
              expects: {
                files: 2,
                errors: 0,
              },
            },
          ]
        : []),
    ]) {
      it(dir, async () => {
        const engine = new ESLint({
          cwd: path.join(TEST_ROOT, dir),
        });
        const results = await engine.lintFiles(["src"]);
        assert.strictEqual(results.length, expects.files);
        assert.strictEqual(
          results.reduce((s, a) => s + a.errorCount, 0),
          expects.errors,
        );
      });
    }
  });
});
