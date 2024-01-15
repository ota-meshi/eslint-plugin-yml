import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/require-string-key";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    parser: require("yaml-eslint-parser"),
    ecmaVersion: 2020,
  },
});

tester.run(
  "require-string-key",
  rule as any,
  loadTestCases("require-string-key"),
);
