import { RuleTester } from "eslint";
import rule from "../../../../src/rules/vue-custom-block/no-parsing-error";
import { loadTestCases } from "../../../utils/utils";
import * as vueESLintParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueESLintParser,
  },
});

tester.run(
  "vue-custom-block/no-parsing-error",
  rule as any,
  loadTestCases("vue-custom-block/no-parsing-error"),
);
