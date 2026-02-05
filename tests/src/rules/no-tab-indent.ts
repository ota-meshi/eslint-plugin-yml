import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-tab-indent.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("no-tab-indent", rule as any, loadTestCases("no-tab-indent"));
