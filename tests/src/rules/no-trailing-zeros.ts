import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-trailing-zeros";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "no-trailing-zeros",
  rule as any,
  loadTestCases("no-trailing-zeros"),
);
