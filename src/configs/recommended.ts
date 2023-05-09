// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import path from "path";
const base = require.resolve("./base");
const baseExtend = path.extname(`${base}`) === ".ts" ? "plugin:yml/base" : base;
export = {
  extends: [baseExtend],
  rules: {
    // eslint-plugin-yml rules
    "yml/no-empty-document": "error",
    "yml/no-empty-key": "error",
    "yml/no-empty-mapping-value": "error",
    "yml/no-empty-sequence-entry": "error",
    "yml/no-irregular-whitespace": "error",
    "yml/no-tab-indent": "error",
    "yml/vue-custom-block/no-parsing-error": "error",
  },
};
