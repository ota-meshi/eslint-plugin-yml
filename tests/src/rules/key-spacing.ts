import { RuleTester } from "eslint";
import rule from "../../../src/rules/key-spacing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run("key-spacing", rule as any, loadTestCases("key-spacing"));
