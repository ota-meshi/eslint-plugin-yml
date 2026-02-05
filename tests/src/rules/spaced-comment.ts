import { RuleTester } from "eslint";
import rule from "../../../src/rules/spaced-comment.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run("spaced-comment", rule as any, loadTestCases("spaced-comment"));
