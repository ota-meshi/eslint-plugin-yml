import { RuleTester } from "eslint";
import rule from "../../../src/rules/require-string-key";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "require-string-key",
  rule as any,
  loadTestCases("require-string-key"),
);
