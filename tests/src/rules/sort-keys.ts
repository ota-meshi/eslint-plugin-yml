import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Linter, RuleTester } from "eslint";
import rule from "../../../src/rules/sort-keys.ts";
import { loadTestCases } from "../../utils/utils.ts";
import plugin from "../../../src/index.ts";

const tester = new RuleTester({});

const OPTIONS_FOR_PACKAGE_JSON = [
  {
    pathPattern: "^$",
    order: [
      "name",
      "version",
      "dependencies",
      "peerDependencies",
      "devDependencies",
      "optionalDependencies",
      "bundledDependencies",
    ],
  },
  {
    pathPattern: "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
    order: {
      type: "asc",
    },
  },
  {
    pathPattern: "^eslintConfig$",
    order: ["root", "plugins", "extends"],
  },
];

const OPTIONS_FOR_JSON_SCHEMA = [
  {
    pathPattern: ".*",
    hasProperties: ["type"],
    order: [
      "type",
      "properties",
      "items",
      "required",
      "minItems",
      "additionalProperties",
      "additionalItems",
    ],
  },
];

tester.run(
  "sort-keys",
  rule,
  loadTestCases(
    "sort-keys",
    {},
    {
      valid: [
        // package.json
        {
          code: fs.readFileSync(
            path.resolve(
              path.dirname(fileURLToPath(import.meta.url)),
              "../../../package.json",
            ),
            "utf-8",
          ),
          options: OPTIONS_FOR_PACKAGE_JSON,
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // JSON Schema
        {
          code: JSON.stringify(rule.meta.schema),
          options: OPTIONS_FOR_JSON_SCHEMA,
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // ignore
        {
          code: `{
            "exports": {
              ".": {
                "require": "./index.cjs",
                "import": "./index.js",
                "types": "./index.d.ts"
              }
            },
            "name": "example"
          }`,
          options: [
            {
              pathPattern: '^exports\\["\\."\\]$',
              order: { type: "ignore" },
            },
            {
              pathPattern: ".*",
              order: { type: "asc" },
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // ignore nested order
        {
          code: `{
            "a": 1,
            "z": 2,
            "b": 3
          }`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // Ignore with line-separated groups
        {
          code: `c: 1

z: 0
b: 2
`,
          options: [
            {
              pathPattern: "^$",
              allowLineSeparatedGroups: true,
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // No safe move across ignored anchor and alias pairs
        {
          code: `b: &x 0
y: *x
z: &q 0
a: *q
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^[yz]$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // No converging local move across ignored anchor and alias pairs
        {
          code: `b: &p 1
w: 0
x:
  use: *p
  define: &q 1
a: *q
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^[wx]$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // nest
        {
          code: `
                    {
                        "a":1,
                        "b":2,
                        "c":3,
                        "d":4,
                        "e":5,
                        "f":6,
                        "g":7,
                        "z":26
                    }
                    `,
          options: [
            {
              pathPattern: "^$",
              order: [
                "a",
                "b",
                {
                  keyPattern: "[cd]",
                  order: { type: "asc" },
                },
                {
                  keyPattern: "[e-g]",
                  order: { type: "asc" },
                },
                "z",
              ],
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
                    {
                        "a":1,
                        "b":2,
                        "c":3,
                        "d":4,
                        "e":5,
                        "f":6,
                        "g":7,
                        "z":26
                    }
                    `,
          options: [
            {
              pathPattern: "^$",
              order: [
                "a",
                "b",
                {
                  order: { type: "asc" },
                },
                "z",
              ],
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
      ],
      invalid: [
        // Nested order patterns use first-match precedence.
        {
          code: `{
            "a": 1,
            "z": 2,
            "b": 3
          }`,
          output: `{
            "a": 1,
            "b": 3,
            "z": 2
          }`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'z' should be after 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `b: 1
z: 2
a: 3
`,
          output: `z: 2
a: 3
b: 1
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'b' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `x: 0

z: 0
c: 1
b: 2
`,
          output: `x: 0

z: 0
b: 2
c: 1
`,
          options: [
            {
              pathPattern: "^$",
              allowLineSeparatedGroups: true,
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'c' should be after 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
b: &x 1
z: *x
a: 2
`,
          output: `
a: 2
b: &x 1
z: *x
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'a' should be before 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `{ b: &x 1, z: *x, a: 2 }
`,
          output: `{ a: 2, b: &x 1, z: *x }
`,
          options: [
            {
              pathPattern: "^$",
              order: ["a", "b"],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'a' should be before 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `b: 0
z: &x 1
a: *x
`,
          output: `z: &x 1
a: *x
b: 0
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'b' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `b: 1
c: 2
z: &x 3
a: *x
`,
          output: `c: 2
z: &x 3
a: *x
b: 1
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'b' should be after 'a'.",
            "Expected mapping keys to be in specified order. 'c' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
b: 0
y: &x 1
z: 0
c: 0
a: *x
`,
          output: `
y: &x 1
z: 0
c: 0
a: *x
b: 0
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^[yz]$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'b' should be after 'a'.",
            "Expected mapping keys to be in specified order. 'c' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `{ a: 0, c: &x 1, y: 0, z: *x, b: 0 }
`,
          output: `{ a: 0, b: 0, c: &x 1, y: 0, z: *x }
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^[yz]$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'b' should be before 'c'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `b: &p 1
x: &q 1
y: *p
a: *q
`,
          output: `x: &q 1
b: &p 1
y: *p
a: *q
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^[xy]$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'b' should be after 'x'.",
            "Expected mapping keys to be in specified order. 'y' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
c: &p 1
z:
  use: *p
  define: &q 1
b: *q
a: 0
`,
          output: `
a: 0
c: &p 1
z:
  use: *p
  define: &q 1
b: *q
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'a' should be before 'c'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `{ c: &p 1, z: { use: *p, define: &q 1 }, b: *q, a: 0 }
`,
          output: `{ a: 0, c: &p 1, z: { use: *p, define: &q 1 }, b: *q }
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^z$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'a' should be before 'c'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
b: 0
d: 0
y: &p 0
a: 0
c: *p
`,
          output: `
a: 0
b: 0
d: 0
y: &p 0
c: *p
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^y$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'd' should be after 'c'.",
            "Expected mapping keys to be in specified order. 'a' should be before 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `{ b: 0, d: 0, y: &p 0, a: 0, c: *p }
`,
          output: `{ a: 0, b: 0, d: 0, y: &p 0, c: *p }
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^y$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'd' should be after 'c'.",
            "Expected mapping keys to be in specified order. 'a' should be before 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
a: 0
d: &p 0
y: &q 0
z: *p
c: 0
b: *q
`,
          output: `
a: 0
y: &q 0
d: &p 0
z: *p
b: *q
c: 0
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^[yz]$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'd' should be after 'y'.",
            "Expected mapping keys to be in specified order. 'z' should be after 'b'.",
            "Expected mapping keys to be in specified order. 'c' should be after 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `{ a: 0, d: &p 0, y: &q 0, z: *p, c: 0, b: *q }
`,
          output: `{ a: 0, y: &q 0, d: &p 0, z: *p, b: *q, c: 0 }
`,
          options: [
            {
              pathPattern: "^$",
              order: [
                {
                  keyPattern: "^[yz]$",
                  order: { type: "ignore" },
                },
                {
                  keyPattern: ".*",
                  order: { type: "asc" },
                },
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'd' should be after 'y'.",
            "Expected mapping keys to be in specified order. 'z' should be after 'b'.",
            "Expected mapping keys to be in specified order. 'c' should be after 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `{
            "dependencies": {
              "z": "1.0.0",
              "a": "1.0.0"
            },
            "exports": {
              ".": {
                "require": "./index.cjs",
                "types": "./index.d.ts"
              }
            }
          }`,
          output: `{
            "dependencies": {
              "a": "1.0.0",
              "z": "1.0.0"
            },
            "exports": {
              ".": {
                "require": "./index.cjs",
                "types": "./index.d.ts"
              }
            }
          }`,
          options: [
            {
              pathPattern: '^exports\\["\\."\\]$',
              order: { type: "ignore" },
            },
            {
              pathPattern: ".*",
              order: { type: "asc" },
            },
          ],
          errors: [
            "Expected mapping keys to be in ascending order. 'z' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // package.json
        {
          code: `
                    {
                        "version": "0.0.0",
                        "name": "test",
                        "eslintConfig": {
                            "root": true,
                            "extends": [],
                            "plugins": [],
                        },
                        "dependencies": {
                            "b": "0.0.1",
                            "a": "0.0.1"
                        }
                    }`,
          output: `
                    {
                        "name": "test",
                        "version": "0.0.0",
                        "eslintConfig": {
                            "root": true,
                            "plugins": [],
                            "extends": [],
                        },
                        "dependencies": {
                            "a": "0.0.1",
                            "b": "0.0.1"
                        }
                    }`,
          options: OPTIONS_FOR_PACKAGE_JSON,
          errors: [
            "Expected mapping keys to be in specified order. 'version' should be after 'name'.",
            "Expected mapping keys to be in specified order. 'extends' should be after 'plugins'.",
            "Expected mapping keys to be in ascending order. 'b' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // JSON Schema
        {
          code: `
                    {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "foo": {
                                "minItems": 2,
                                "type": "array"
                            }
                        }
                    }`,
          output: `
                    {
                        "type": "object",
                        "properties": {
                            "foo": {
                                "minItems": 2,
                                "type": "array"
                            }
                        },
                        "additionalProperties": false
                    }`,
          options: OPTIONS_FOR_JSON_SCHEMA,
          errors: [
            "Expected mapping keys to be in specified order. 'additionalProperties' should be after 'properties'.",
            "Expected mapping keys to be in specified order. 'minItems' should be after 'type'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
                    {
                        "type": "object",
                        "properties": {
                            "foo": {
                                "minItems": 2,
                                "type": "array"
                            }
                        },
                        "additionalProperties": false
                    }`,
          output: `
                    {
                        "type": "object",
                        "properties": {
                            "foo": {
                                "type": "array",
                                "minItems": 2
                            }
                        },
                        "additionalProperties": false
                    }`,
          options: OPTIONS_FOR_JSON_SCHEMA,
          errors: [
            "Expected mapping keys to be in specified order. 'minItems' should be after 'type'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // inline comment moves with its key, no duplication
        {
          code: `- b: 1 # comment
  a: 2
`,
          output: `- a: 2
  b: 1 # comment
`,
          options: [{ order: { type: "asc" }, pathPattern: ".*" }],
          errors: [
            "Expected mapping keys to be in ascending order. 'b' should be after 'a'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // inline comment on the pair above the moved key is not duplicated
        {
          code: `- b: 1
  c: 2 # comment
  a: 3
`,
          output: `- a: 3
  b: 1
  c: 2 # comment
`,
          options: [{ order: { type: "asc" }, pathPattern: ".*" }],
          errors: [
            "Expected mapping keys to be in ascending order. 'a' should be before 'b'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // Other
        {
          code: `
                    {
                        "\t": {
                            "b": 42,
                            "a": 42,
                        },
                        "arr": [
                            {
                                "d": 42,
                                "c": 42,
                            },
                            {
                                "f": 42,
                                "e": 42,
                            },
                        ]
                    }`,
          output: `
                    {
                        "\t": {
                            "a": 42,
                            "b": 42,
                        },
                        "arr": [
                            {
                                "d": 42,
                                "c": 42,
                            },
                            {
                                "e": 42,
                                "f": 42,
                            },
                        ]
                    }`,
          options: [
            {
              pathPattern: '^\\["\\\\t"\\]$',
              order: { type: "asc" },
            },
            {
              pathPattern: "^arr\\[1\\]$",
              order: { type: "asc" },
            },
          ],
          errors: [
            "Expected mapping keys to be in ascending order. 'b' should be after 'a'.",
            "Expected mapping keys to be in ascending order. 'f' should be after 'e'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },

        // nest
        {
          code: `
                    {
                        "a":1,
                        "b":2,
                        "d":4,
                        "c":3,
                        "e":5,
                        "g":7,
                        "f":6,
                        "z":26
                    }
                    `,
          output: `
                    {
                        "a":1,
                        "b":2,
                        "c":3,
                        "d":4,
                        "e":5,
                        "f":6,
                        "g":7,
                        "z":26
                    }
                    `,
          options: [
            {
              pathPattern: "^$",
              order: [
                "a",
                "b",
                {
                  keyPattern: "[cd]",
                  order: { type: "asc" },
                },
                {
                  keyPattern: "[e-g]",
                  order: { type: "asc" },
                },
                "z",
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'd' should be after 'c'.",
            "Expected mapping keys to be in specified order. 'f' should be before 'g'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
                    {
                        "a":1,
                        "b":2,
                        "z":26,
                        "c":3,
                        "d":4,
                        "e":5,
                        "f":6,
                        "g":7
                    }
                    `,
          output: `
                    {
                        "a":1,
                        "b":2,
                        "c":3,
                        "d":4,
                        "e":5,
                        "f":6,
                        "g":7,
                        "z":26
                    }
                    `,
          options: [
            {
              pathPattern: "^$",
              order: [
                "a",
                "b",
                {
                  keyPattern: "[cd]",
                  order: { type: "asc" },
                },
                {
                  keyPattern: "[e-g]",
                  order: { type: "asc" },
                },
                "z",
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'z' should be after 'g'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
                    {
                        "a":1,
                        "b":2,
                        "c":3,
                        "d":4,
                        "z":26,
                        "e":5,
                        "f":6,
                        "g":7
                    }
                    `,
          output: `
                    {
                        "a":1,
                        "b":2,
                        "c":3,
                        "d":4,
                        "e":5,
                        "f":6,
                        "g":7,
                        "z":26
                    }
                    `,
          options: [
            {
              pathPattern: "^$",
              order: [
                "a",
                "b",
                {
                  keyPattern: "[cd]",
                  order: { type: "asc" },
                },
                {
                  keyPattern: "[e-g]",
                  order: { type: "asc" },
                },
                "z",
              ],
            },
          ],
          errors: [
            "Expected mapping keys to be in specified order. 'z' should be after 'g'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `- b: 1
  c: 2
  a: 3
`,
          errors: [
            {
              message:
                "Expected mapping keys to be in ascending order. 'a' should be before 'b'.",
              line: 3,
              column: 3,
            },
          ],
          output: `- a: 3
  b: 1
  c: 2
`,
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
- b: 1
  c: 2
  a: 3
`,
          errors: [
            {
              message:
                "Expected mapping keys to be in ascending order. 'a' should be before 'b'.",
              line: 4,
              column: 3,
            },
          ],
          output: `
- a: 3
  b: 1
  c: 2
`,
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `b: 1
c: 2
a: 3
`,
          errors: [
            {
              message:
                "Expected mapping keys to be in ascending order. 'a' should be before 'b'.",
              line: 3,
              column: 1,
            },
          ],
          output: `
a: 3
b: 1
c: 2
`,
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: ` b: 1
 c: 2
 a: 3
`,
          errors: [
            {
              message:
                "Expected mapping keys to be in ascending order. 'a' should be before 'b'.",
              line: 3,
              column: 2,
            },
          ],
          output: `
 a: 3
 b: 1
 c: 2
`,
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
b: 1
c: 2
a: 3
`,
          errors: [
            {
              message:
                "Expected mapping keys to be in ascending order. 'a' should be before 'b'.",
              line: 4,
              column: 1,
            },
          ],
          output: `
a: 3
b: 1
c: 2
`,
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `
product:
    - sku         : BL394D
      quantity    : 4
      description : Basketball
      price       : 450.00
    - sku         : BL4438H
      quantity    : 1
      description : Super Hoop
      price       : 2392.00
`,
          output: `
product:
    - quantity    : 4
      description : Basketball
      price       : 450.00
      sku         : BL394D
    - quantity    : 1
      description : Super Hoop
      price       : 2392.00
      sku         : BL4438H
`,
          errors: [
            "Expected mapping keys to be in ascending order. 'sku' should be after 'price'.",
            "Expected mapping keys to be in ascending order. 'quantity' should be after 'price'.",
            "Expected mapping keys to be in ascending order. 'sku' should be after 'price'.",
            "Expected mapping keys to be in ascending order. 'quantity' should be after 'price'.",
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `b: 2
a: 1
c: 3`,
          output: `a: 1
b: 2
c: 3`,
          errors: [
            {
              message:
                "Expected mapping keys to be in ascending order. 'b' should be after 'a'.",
              line: 1,
              column: 1,
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
        {
          code: `b: |
  eslint-plugin-yml is ESLint plugin provides linting rules for YAML.
a: 1
c: 3`,
          output: `a: 1
b: |
  eslint-plugin-yml is ESLint plugin provides linting rules for YAML.
c: 3`,
          errors: [
            {
              message:
                "Expected mapping keys to be in ascending order. 'b' should be after 'a'.",
              line: 1,
              column: 1,
            },
          ],
          // @ts-expect-error -- type bug?
          plugins: { yml: plugin },
          language: "yml/yaml",
        },
      ],
    },
  ),
);

describe("sort-keys autofix convergence", () => {
  it("does not cycle when an ignored anchor blocks reordering", () => {
    const result = new Linter().verifyAndFix(
      `c: 0
d: 0
b: 0
x: &p 1
a: *p
`,
      [
        {
          files: ["**/*.yaml"],
          plugins: { yml: plugin },
          language: "yml/yaml",
          rules: {
            "yml/sort-keys": [
              "error",
              {
                pathPattern: "^$",
                order: [
                  {
                    keyPattern: "^x$",
                    order: { type: "ignore" },
                  },
                  {
                    keyPattern: ".*",
                    order: { type: "asc" },
                  },
                ],
              },
            ],
          },
        },
      ],
      "test.yaml",
    );

    assert.strictEqual(
      result.output,
      `x: &p 1
a: *p
b: 0
c: 0
d: 0
`,
    );
    assert.deepStrictEqual(result.messages, []);
  });

  it("does not cycle when a longer common subsequence precedes an ignored anchor", () => {
    const result = new Linter().verifyAndFix(
      `b: 0
c: 0
d: 0
e: 0
x: &p 1
a: *p
`,
      [
        {
          files: ["**/*.yaml"],
          plugins: { yml: plugin },
          language: "yml/yaml",
          rules: {
            "yml/sort-keys": [
              "error",
              {
                pathPattern: "^$",
                order: [
                  {
                    keyPattern: "^x$",
                    order: { type: "ignore" },
                  },
                  {
                    keyPattern: ".*",
                    order: { type: "asc" },
                  },
                ],
              },
            ],
          },
        },
      ],
      "test.yaml",
    );

    // The existing `fixToMoveUpForBlock` file-start bug will be fixed
    // separately; remove the expected leading newline with that fix.
    assert.strictEqual(
      result.output,
      `
x: &p 1
a: *p
b: 0
c: 0
d: 0
e: 0
`,
    );
    assert.deepStrictEqual(result.messages, []);
  });

  it("does not cycle when fixes for disjoint pairs have overlapping ranges", () => {
    const result = new Linter().verifyAndFix(
      `c: &p 1
x: *p
d: 0
a: 0
b: 0
`,
      [
        {
          files: ["**/*.yaml"],
          plugins: { yml: plugin },
          language: "yml/yaml",
          rules: {
            "yml/sort-keys": [
              "error",
              {
                pathPattern: "^$",
                order: [
                  {
                    keyPattern: "^x$",
                    order: { type: "ignore" },
                  },
                  {
                    keyPattern: ".*",
                    order: { type: "asc" },
                  },
                ],
              },
            ],
          },
        },
      ],
      "test.yaml",
    );

    // The existing `fixToMoveUpForBlock` file-start bug will be fixed
    // separately; remove the expected leading newline with that fix.
    assert.strictEqual(
      result.output,
      `
a: 0
b: 0
c: &p 1
x: *p
d: 0
`,
    );
    assert.deepStrictEqual(result.messages, []);
  });
});
