import { RuleTester } from "eslint";
import rule from "../../../src/rules/flow-sequence-bracket-newline";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "flow-sequence-bracket-newline",
  rule as any,
  loadTestCases("flow-sequence-bracket-newline")
);
