import { RuleTester } from "eslint";
import rule from "../../../src/rules/flow-mapping-curly-spacing.ts";
import { loadTestCases } from "../../utils/utils.ts";

const tester = new RuleTester({});

tester.run(
  "flow-mapping-curly-spacing",
  rule as any,
  loadTestCases("flow-mapping-curly-spacing"),
);
