// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { Linter } from "eslint";
import base from "./base";
export default [
  ...base,
  {
    rules: {
      // eslint-plugin-yml rules
      "yml/file-extension": "error",
      "yml/require-string-key": "error",
      "yml/sort-keys": [
        "error",
        { order: { type: "asc" }, pathPattern: "^.*$" },
      ],
      "yml/sort-sequence-values": [
        "error",
        { order: { type: "asc" }, pathPattern: "^.*$" },
      ],
    },
  },
] satisfies Linter.FlatConfig[];
