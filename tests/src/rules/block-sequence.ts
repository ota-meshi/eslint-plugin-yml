import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-sequence.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run("block-sequence", rule as any, loadTestCases("block-sequence"));
