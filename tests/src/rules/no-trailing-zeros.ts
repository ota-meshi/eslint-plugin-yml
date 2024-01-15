import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/no-trailing-zeros";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    parser: require("yaml-eslint-parser"),
    ecmaVersion: 2020,
  },
});

tester.run(
  "no-trailing-zeros",
  rule as any,
  loadTestCases("no-trailing-zeros"),
);
