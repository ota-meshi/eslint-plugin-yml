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
      "yml/no-empty-document": "error",
      "yml/no-empty-key": "error",
      "yml/no-empty-mapping-value": "error",
      "yml/no-empty-sequence-entry": "error",
      "yml/no-irregular-whitespace": "error",
      "yml/no-tab-indent": "error",
      "yml/vue-custom-block/no-parsing-error": "error"
    },
  },
] satisfies Linter.FlatConfig[];
