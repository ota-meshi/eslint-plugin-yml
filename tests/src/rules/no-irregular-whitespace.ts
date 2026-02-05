import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-irregular-whitespace.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run(
  "no-irregular-whitespace",
  rule as any,
  loadTestCases("no-irregular-whitespace"),
);
