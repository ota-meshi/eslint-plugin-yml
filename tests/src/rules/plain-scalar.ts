import { RuleTester } from "eslint";
import rule from "../../../src/rules/plain-scalar.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("plain-scalar", rule as any, loadTestCases("plain-scalar"));
