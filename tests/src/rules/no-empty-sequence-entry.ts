import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-empty-sequence-entry.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "no-empty-sequence-entry",
  rule as any,
  loadTestCases("no-empty-sequence-entry"),
);
