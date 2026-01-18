import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-sequence";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({});

tester.run("block-sequence", rule as any, loadTestCases("block-sequence"));
