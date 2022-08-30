import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-mapping";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  parser: require.resolve("yaml-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("block-mapping", rule as any, loadTestCases("block-mapping"));
