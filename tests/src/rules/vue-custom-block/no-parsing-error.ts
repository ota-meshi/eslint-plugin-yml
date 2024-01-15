import { RuleTester } from "../../../utils/eslint-compat";
import rule from "../../../../src/rules/vue-custom-block/no-parsing-error";
import { loadTestCases } from "../../../utils/utils";

const tester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    parser: require("yaml-eslint-parser"),
    ecmaVersion: 2020,
  },
});

tester.run(
  "vue-custom-block/no-parsing-error",
  rule as any,
  loadTestCases("vue-custom-block/no-parsing-error"),
);
