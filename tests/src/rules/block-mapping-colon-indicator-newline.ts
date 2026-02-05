import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-mapping-colon-indicator-newline.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "block-mapping-colon-indicator-newline",
  rule as any,
  loadTestCases("block-mapping-colon-indicator-newline"),
);
