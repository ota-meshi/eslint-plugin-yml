import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-empty-sequence-entry";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "no-empty-sequence-entry",
  rule as any,
  loadTestCases("no-empty-sequence-entry"),
);
