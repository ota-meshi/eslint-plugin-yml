import { RuleTester } from "eslint";
import rule from "../../../src/rules/require-string-key.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "require-string-key",
  rule as any,
  loadTestCases("require-string-key"),
);
