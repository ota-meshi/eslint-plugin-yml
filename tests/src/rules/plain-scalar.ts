import { RuleTester } from "eslint";
import rule from "../../../src/rules/plain-scalar";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("plain-scalar", rule as any, loadTestCases("plain-scalar"));
