import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-mapping.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run("block-mapping", rule as any, loadTestCases("block-mapping"));
