import { RuleTester } from "eslint";
import rule from "../../../src/rules/quotes";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("quotes", rule as any, loadTestCases("quotes"));
