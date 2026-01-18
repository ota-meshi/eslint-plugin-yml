import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-trailing-zeros";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "no-trailing-zeros",
  rule as any,
  loadTestCases("no-trailing-zeros"),
);
