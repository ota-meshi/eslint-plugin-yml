import { RuleTester } from "eslint";
import rule from "../../../src/rules/no-trailing-spaces.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});
const trailingSpaces = "   ";
const trailingTabAndSpace = "\t ";

const error = {
  message: "Trailing spaces not allowed.",
};

tester.run(
  "no-trailing-spaces",
  rule,
  loadTestCases(
    "no-trailing-spaces",
    {},
    {
      valid: [
        {
          code: `# comment${trailingSpaces}
key: value
inline: value # comment${trailingTabAndSpace}
`,
          options: [{ ignoreComments: true }],
        },
        {
          code: `key: value
${trailingSpaces}
next: value
`,
          options: [{ skipBlankLines: true }],
        },
        {
          code: `block: |
  keep${trailingSpaces}
  value
`,
        },
      ],
      invalid: [
        {
          code: `# comment${trailingSpaces}
key: value${trailingSpaces}
`,
          output: `# comment
key: value
`,
          errors: [
            {
              ...error,
              line: 1,
              column: 10,
            },
            {
              ...error,
              line: 2,
              column: 11,
            },
          ],
        },
        {
          code: `# comment${trailingSpaces}
key: value${trailingSpaces}
inline: value # comment${trailingSpaces}
`,
          output: `# comment${trailingSpaces}
key: value
inline: value # comment${trailingSpaces}
`,
          options: [{ ignoreComments: true }],
          errors: [
            {
              ...error,
              line: 2,
              column: 11,
            },
          ],
        },
        {
          code: `key: value
${trailingSpaces}
next: value${trailingSpaces}
`,
          output: `key: value
${trailingSpaces}
next: value
`,
          options: [{ skipBlankLines: true }],
          errors: [
            {
              ...error,
              line: 3,
              column: 12,
            },
          ],
        },
      ],
    },
  ),
);
