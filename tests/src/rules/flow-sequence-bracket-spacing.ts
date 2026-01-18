import { RuleTester } from "eslint";
import rule from "../../../src/rules/flow-sequence-bracket-spacing";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({});

tester.run(
  "flow-sequence-bracket-spacing",
  rule as any,
  loadTestCases("flow-sequence-bracket-spacing"),
);
