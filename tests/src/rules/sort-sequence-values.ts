import { RuleTester } from "eslint";
import rule from "../../../src/rules/sort-sequence-values";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "sort-sequence-values",
  rule as any,
  loadTestCases("sort-sequence-values", { skipOutputTest: true })
);
