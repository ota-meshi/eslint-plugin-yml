import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-mapping-colon-indicator-newline";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "block-mapping-colon-indicator-newline",
  rule as any,
  loadTestCases("block-mapping-colon-indicator-newline"),
);
