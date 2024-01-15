import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/plain-scalar";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    parser: require("yaml-eslint-parser"),
    ecmaVersion: 2020,
  },
});

tester.run("plain-scalar", rule as any, loadTestCases("plain-scalar"));
