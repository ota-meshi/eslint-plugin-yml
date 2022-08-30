import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-tab-indent";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("no-tab-indent", rule as any, loadTestCases("no-tab-indent"));
