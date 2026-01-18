import { RuleTester } from "eslint";
import rule from "../../../src/rules/block-sequence-hyphen-indicator-newline";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({});

tester.run(
  "block-sequence-hyphen-indicator-newline",
  rule as any,
  loadTestCases("block-sequence-hyphen-indicator-newline"),
);
