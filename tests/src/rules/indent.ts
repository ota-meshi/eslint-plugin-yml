import { RuleTester } from "eslint";
import rule from "../../../src/rules/indent";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("indent", rule as any, loadTestCases("indent"));
