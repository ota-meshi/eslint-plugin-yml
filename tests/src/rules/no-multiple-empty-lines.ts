import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-multiple-empty-lines.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "no-multiple-empty-lines",
  rule as any,
  loadTestCases("no-multiple-empty-lines"),
);
