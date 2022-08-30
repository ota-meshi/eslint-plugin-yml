import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-empty-sequence-entry";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "no-empty-sequence-entry",
  rule as any,
  loadTestCases("no-empty-sequence-entry")
);
