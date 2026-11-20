import { RuleTester } from "eslint";
import rule from "../../../src/rules/max-len.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

// Fixture files (including `.vue` files) set their own language.
const fixtureTester = new RuleTester({});
const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

/** Build a `key: value` line with exactly `length` characters. */
function line(length: number, key = "key") {
  return `${key}: ${"a".repeat(length - key.length - 2)}`;
}

fixtureTester.run("max-len", rule, loadTestCases("max-len"));

tester.run("max-len", rule, {
  valid: [
    // default limit is 80
    `${line(80)}\n`,
    {
      code: `${line(20)}\n`,
      options: [{ code: 20 }],
    },
    // tabs inside a value count as `tabWidth` columns
    {
      code: `a: "\tb"\n`,
      options: [{ code: 8, tabWidth: 2 }],
    },
    // ignoreComments ignores full-line and trailing comments
    {
      code: `# ${"c".repeat(30)}\nkey: value # ${"c".repeat(30)}\n`,
      options: [{ code: 20, ignoreComments: true }],
    },
    // ignoreTrailingComments measures only the part before the comment
    {
      code: `key: value # ${"c".repeat(30)}\n`,
      options: [{ code: 20, ignoreTrailingComments: true }],
    },
    // comments sets a separate limit for full-line comments
    {
      code: `# ${"c".repeat(28)}\nkey: value\n`,
      options: [{ code: 20, comments: 30 }],
    },
    // ignoreUrls
    {
      code: "url: https://example.com/a/very/long/path\n",
      options: [{ code: 20, ignoreUrls: true }],
    },
    // ignoreStrings ignores double-quoted and single-quoted scalars,
    // including every line of a multi-line quoted scalar
    {
      code: `a: "${"s".repeat(30)}"\nb: '${"s".repeat(30)}'\nc: "${"s".repeat(30)}\n  ${"s".repeat(30)}"\n`,
      options: [{ code: 20, ignoreStrings: true }],
    },
    // ignorePattern
    {
      code: `description: ${"d".repeat(30)}\n`,
      options: [{ code: 20, ignorePattern: "^description:" }],
    },
  ],
  invalid: [
    {
      code: `${line(81)}\n`,
      errors: [
        {
          message: "This line has a length of 81. Maximum allowed is 80.",
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 82,
        },
      ],
    },
    {
      code: `${line(20)}\n${line(21, "other")}\n`,
      options: [{ code: 20 }],
      errors: [
        {
          message: "This line has a length of 21. Maximum allowed is 20.",
          line: 2,
          column: 1,
          endColumn: 22,
        },
      ],
    },
    // lines before and after the YAML content are checked too
    {
      code: `\n# ${"c".repeat(30)}\nkey: value\n\n# ${"c".repeat(30)}\n`,
      options: [{ code: 20 }],
      errors: [
        {
          message: "This line has a length of 32. Maximum allowed is 20.",
          line: 2,
        },
        {
          message: "This line has a length of 32. Maximum allowed is 20.",
          line: 5,
        },
      ],
    },
    // code: 0 reports every non-empty line
    {
      code: "a: 1\n",
      options: [{ code: 0 }],
      errors: [
        {
          message: "This line has a length of 4. Maximum allowed is 0.",
          line: 1,
        },
      ],
    },
    // a tab is expanded to the next tab stop
    {
      code: `a: "\tb"\n`,
      options: [{ code: 9 }],
      errors: [
        {
          message: "This line has a length of 10. Maximum allowed is 9.",
          line: 1,
        },
      ],
    },
    // multi-byte characters count as one column each
    {
      code: `key: ${"😀".repeat(16)}\n`,
      options: [{ code: 20 }],
      errors: [
        {
          message: "This line has a length of 21. Maximum allowed is 20.",
          line: 1,
        },
      ],
    },
    // comments are measured against `code` by default
    {
      code: `# ${"c".repeat(30)}\nkey: value # ${"c".repeat(30)}\n`,
      options: [{ code: 20 }],
      errors: [
        {
          message: "This line has a length of 32. Maximum allowed is 20.",
          line: 1,
        },
        {
          message: "This line has a length of 43. Maximum allowed is 20.",
          line: 2,
        },
      ],
    },
    // ignoreTrailingComments still checks full-line comments
    // and the code before a trailing comment
    {
      code: `# ${"c".repeat(30)}\n${line(21)} # comment\n`,
      options: [{ code: 20, ignoreTrailingComments: true }],
      errors: [
        {
          message: "This line has a length of 32. Maximum allowed is 20.",
          line: 1,
        },
        {
          message: "This line has a length of 21. Maximum allowed is 20.",
          line: 2,
          column: 1,
          endColumn: 22,
        },
      ],
    },
    // comments: full-line comments use the comment limit (line 2 is exactly 30),
    // code lines (including their trailing comments) use `code`
    {
      code: `# ${"c".repeat(29)}\n  # ${"c".repeat(26)}\nkey: value # ${"c".repeat(10)}\n`,
      options: [{ code: 20, comments: 30 }],
      errors: [
        {
          message:
            "This line has a comment length of 31. Maximum allowed is 30.",
          line: 1,
        },
        {
          message: "This line has a length of 23. Maximum allowed is 20.",
          line: 3,
        },
      ],
    },
    // ignoreUrls only skips lines that contain a URL
    {
      code: `url: https://example.com/a/very/long/path\n${line(21)}\n`,
      options: [{ code: 20, ignoreUrls: true }],
      errors: [
        {
          message: "This line has a length of 21. Maximum allowed is 20.",
          line: 2,
        },
      ],
    },
    // ignoreStrings does not skip plain or block scalars
    {
      code: `quoted: "${"s".repeat(30)}"\nplain: ${"p".repeat(30)}\nblock: |\n  ${"b".repeat(30)}\n`,
      options: [{ code: 20, ignoreStrings: true }],
      errors: [
        {
          message: "This line has a length of 37. Maximum allowed is 20.",
          line: 2,
        },
        {
          message: "This line has a length of 32. Maximum allowed is 20.",
          line: 4,
        },
      ],
    },
    // ignorePattern only skips matching lines
    {
      code: `description: ${"d".repeat(30)}\nsummary: ${"s".repeat(30)}\n`,
      options: [{ code: 20, ignorePattern: "^description:" }],
      errors: [
        {
          message: "This line has a length of 39. Maximum allowed is 20.",
          line: 2,
        },
      ],
    },
  ],
});
