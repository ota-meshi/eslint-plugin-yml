import { RuleTester } from "eslint";
import rule from "../../../src/rules/quotes";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("quotes", rule as any, loadTestCases("quotes"));
