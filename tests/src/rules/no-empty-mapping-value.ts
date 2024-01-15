import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/no-empty-mapping-value";
import { loadTestCases } from "../../utils/utils";
import * as yamlESLintParser from "yaml-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: yamlESLintParser,
    ecmaVersion: 2020,
  },
});

tester.run(
  "no-empty-mapping-value",
  rule as any,
  loadTestCases("no-empty-mapping-value"),
);
