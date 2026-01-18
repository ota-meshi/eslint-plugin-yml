import { RuleTester } from "eslint";
import rule from "../../../src/rules/flow-mapping-curly-newline";
import { loadTestCases } from "../../utils/utils";

const tester = new RuleTester({});

tester.run(
  "flow-mapping-curly-newline",
  rule as any,
  loadTestCases("flow-mapping-curly-newline"),
);
