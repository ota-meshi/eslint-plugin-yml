import { RuleTester } from "eslint";
import rule from "../../../src/rules/plain-scalar";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("plain-scalar", rule as any, loadTestCases("plain-scalar"));
