import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-empty-document";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "no-empty-document",
  rule as any,
  loadTestCases("no-empty-document"),
);
