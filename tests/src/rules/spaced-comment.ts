import { RuleTester } from "eslint";
import rule from "../../../src/rules/spaced-comment";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({});

tester.run("spaced-comment", rule as any, loadTestCases("spaced-comment"));
