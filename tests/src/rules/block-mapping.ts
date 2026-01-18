import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-mapping";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({});

tester.run("block-mapping", rule as any, loadTestCases("block-mapping"));
