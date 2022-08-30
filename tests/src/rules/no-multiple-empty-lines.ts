import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-multiple-empty-lines";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "no-multiple-empty-lines",
  rule as any,
  loadTestCases("no-multiple-empty-lines")
);
