import assert from "node:assert";
import plugin from "../../../src/index.ts";
import { ESLint } from "eslint";
import { builtinRules } from "eslint/use-at-your-own-risk";

describe("Test to make sure that ESLint core rules don't crash with language: 'yml/yaml'", () => {
  const code = `# Test YAML file
title: "YAML Example"
number: 42
float: 3.14
bool: true
date: 1979-05-27T07:32:00-08:00

owner:
  name: "Tom Preston-Werner"

database:
  enabled: true
  ports:
    - 8001
    - 8002
    - 8003

products:
  - name: "Hammer"
    sku: 738594937
  - name: "Nail"
    sku: 284758393
`;

  for (const [ruleId] of builtinRules) {
    it(`ESLint core rule '${ruleId}' should not crash`, async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
          {
            plugins: {
              yml: plugin,
            },
            files: ["**/*.yaml", "**/*.yml"],
            language: "yml/yaml",
            rules: {
              [ruleId]: "error",
            },
          },
        ],
      });

      // Make sure linting can be performed without crashing
      const results = await eslint.lintText(code, { filePath: "test.yaml" });

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 1);
      assert.deepStrictEqual(results[0].messages, []);
    });
  }
});
