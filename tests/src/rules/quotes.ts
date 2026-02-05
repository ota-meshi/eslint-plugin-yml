import { RuleTester } from "eslint";
import rule from "../../../src/rules/quotes.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("quotes", rule as any, loadTestCases("quotes"));
