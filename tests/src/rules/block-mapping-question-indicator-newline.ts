import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/block-mapping-question-indicator-newline";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    parser: require("yaml-eslint-parser"),
    ecmaVersion: 2020,
  },
});

tester.run(
  "block-mapping-question-indicator-newline",
  rule as any,
  loadTestCases("block-mapping-question-indicator-newline"),
);
