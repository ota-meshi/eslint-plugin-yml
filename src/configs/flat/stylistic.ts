// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { Linter } from "eslint";
import base from "./base.js";

const config: Linter.Config[] = [
  ...base,
  {
    rules: {
      // eslint-plugin-yml rules
      "yml/file-extension": "error",
      "yml/require-string-key": "error",
      "yml/sort-keys": "error",
    },
  },
];

export default config;
