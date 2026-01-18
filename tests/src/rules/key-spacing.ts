import { RuleTester } from "eslint";
import rule from "../../../src/rules/key-spacing";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({});

tester.run("key-spacing", rule as any, loadTestCases("key-spacing"));
