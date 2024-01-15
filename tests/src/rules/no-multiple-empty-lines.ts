import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/no-multiple-empty-lines";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    parser: require("yaml-eslint-parser"),
    ecmaVersion: 2020,
  },
});

tester.run(
  "no-multiple-empty-lines",
  rule as any,
  loadTestCases("no-multiple-empty-lines"),
);
