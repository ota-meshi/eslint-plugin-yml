import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-tab-indent";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("no-tab-indent", rule as any, loadTestCases("no-tab-indent"));
