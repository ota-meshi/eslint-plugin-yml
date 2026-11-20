import { RuleTester } from "eslint";
import rule from "../../../src/rules/sort-sequence-values.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({});

tester.run(
  "sort-sequence-values",
  rule,
  loadTestCases(
    "sort-sequence-values",
    { skipOutputTest: true },
    {
      valid: [
        {
          code: `
items:
  - name: a
  - name: b
  - name: c
`,
          options: [
            {
              pathPattern: "^items$",
              order: { type: "asc", key: "name" },
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
items:
  - name: a
  - id: 1
  - name: b
`,
          options: [
            {
              pathPattern: "^items$",
              order: { type: "asc", key: "name" },
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `items: [{ name: a }, { name: b }, x, y]`,
          options: [
            {
              pathPattern: "^items$",
              order: [
                { order: { type: "asc", key: "name" } },
                { order: { type: "asc" } },
              ],
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
      ],
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
        {
          code: `
items:
  - name: c
  - name: b
  - name: a
`,
          output: `
items:
  - name: b
  - name: a
  - name: c
`,
          options: [
            {
              pathPattern: "^items$",
              order: { type: "asc", key: "name" },
            },
          ],
          errors: [
            "Expected sequence values to be in ascending by 'name' order. 'c' should be after 'a'.",
            "Expected sequence values to be in ascending by 'name' order. 'b' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `items: [{ name: b }, { name: a }]`,
          output: `items: [ { name: a },{ name: b }]`,
          options: [
            {
              pathPattern: "^items$",
              order: [{ order: { type: "asc", key: "name" } }],
            },
          ],
          errors: [
            "Expected sequence values to be in specified order. '{ name: b }' should be after '{ name: a }'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
      ],
    },
  ),
);
