import { RuleTester } from "eslint";
import rule from "../../../src/rules/require-string-key";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run(
  "require-string-key",
  rule as any,
  loadTestCases("require-string-key"),
);
