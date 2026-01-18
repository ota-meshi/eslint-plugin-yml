import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-multiple-empty-lines";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "no-multiple-empty-lines",
  rule as any,
  loadTestCases("no-multiple-empty-lines"),
);
