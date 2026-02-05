import { RuleTester } from "eslint";
import rule from "../../../src/rules/flow-sequence-bracket-newline.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run(
  "flow-sequence-bracket-newline",
  rule as any,
  loadTestCases("flow-sequence-bracket-newline"),
);
