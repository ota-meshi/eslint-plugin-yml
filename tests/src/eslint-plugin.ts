import path from "path";
import assert from "assert";
import plugin from "../../src/index";
import { LegacyESLint, ESLint } from "../utils/eslint-compat";
import { setPlugin } from "../fixtures/integrations/eslint-plugin/plugin-store.cjs";
import semver from "semver";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

setPlugin(plugin);

const TEST_ROOT = path.join(
  __dirname,
  "../fixtures/integrations/eslint-plugin",
);

describe("Integration with eslint-plugin-yml", () => {
  describe("should lint without errors (legacy)", () => {
    for (const { dir, expects } of [
      {
        dir: "legacy-test01",
        expects: {
          files: 2,
          errors: 0,
        },
      },
      {
        // https://github.com/ota-meshi/eslint-plugin-yml/issues/89
        dir: "legacy-issue89",
        expects: {
          files: 1,
          errors: 0,
        },
      },
    ]) {
      it(dir, async () => {
        const engine = new LegacyESLint({
          cwd: path.join(TEST_ROOT, dir),
          extensions: [".js", ".yml"],
          plugins: { "eslint-plugin-yml": plugin as any },
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
      ...(semver.satisfies(process.version, ">=18")
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
