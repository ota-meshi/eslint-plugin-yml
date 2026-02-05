import { RuleTester } from "eslint";
import rule from "../../../src/rules/indent.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run("indent", rule as any, loadTestCases("indent"));
