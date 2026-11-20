import assert from "node:assert";
import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-boolean-key.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

describe("no-boolean-key metadata", () => {
  it("is an opt-in suggestion without fixes or suggestions", () => {
    assert.strictEqual(rule.meta.docs.ruleId, "yml/no-boolean-key");
    assert.strictEqual(
      rule.meta.docs.description,
      "disallow boolean mapping keys",
    );
    assert.strictEqual(rule.meta.docs.categories, null);
    assert.deepStrictEqual(rule.meta.schema, []);
    assert.strictEqual(rule.meta.type, "suggestion");
    assert.strictEqual(rule.meta.fixable, undefined);
    assert.strictEqual(rule.meta.hasSuggestions, undefined);
  });
});

tester.run("no-boolean-key", rule, loadTestCases("no-boolean-key"));
