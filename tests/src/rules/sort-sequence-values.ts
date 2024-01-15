import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/sort-sequence-values";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    parser: require("yaml-eslint-parser"),
    ecmaVersion: 2020,
  },
});

tester.run(
  "sort-sequence-values",
  rule as any,
  loadTestCases("sort-sequence-values", { skipOutputTest: true }),
);
