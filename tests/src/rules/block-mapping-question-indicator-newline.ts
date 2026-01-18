import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-mapping-question-indicator-newline";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "block-mapping-question-indicator-newline",
  rule as any,
  loadTestCases("block-mapping-question-indicator-newline"),
);
