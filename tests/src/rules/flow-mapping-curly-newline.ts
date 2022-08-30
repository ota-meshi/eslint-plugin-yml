import { RuleTester } from "eslint";
import rule from "../../../src/rules/flow-mapping-curly-newline";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "flow-mapping-curly-newline",
  rule as any,
  loadTestCases("flow-mapping-curly-newline")
);
