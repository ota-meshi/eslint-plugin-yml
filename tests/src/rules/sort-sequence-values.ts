import { RuleTester } from "eslint";
import rule from "../../../src/rules/sort-sequence-values";
import { loadTestCases } from "../../utils/utils";
import plugin from "../../../src/index";

const tester = new RuleTester({});

tester.run(
  "sort-sequence-values",
  rule as any,
  loadTestCases(
    "sort-sequence-values",
    { skipOutputTest: true },
    {
      valid: [],
      invalid: [
        {
          code: `["3","2","1"]`,
          output: `["2","1","3"]`,
          options: [
            {
              pathPattern: ".*",
              order: ["2", "1", "3"],
            },
          ],
          errors: [
            "Expected sequence values to be in specified order. '3' should be after '1'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
      ],
    },
  ),
);
