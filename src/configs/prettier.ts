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
    "yml/block-mapping-colon-indicator-newline": "off",
    "yml/block-mapping-question-indicator-newline": "off",
    "yml/block-sequence-hyphen-indicator-newline": "off",
    "yml/flow-mapping-curly-newline": "off",
    "yml/flow-mapping-curly-spacing": "off",
    "yml/flow-sequence-bracket-newline": "off",
    "yml/flow-sequence-bracket-spacing": "off",
    "yml/indent": "off",
    "yml/key-spacing": "off",
    "yml/no-multiple-empty-lines": "off",
    "yml/no-trailing-zeros": "off",
    "yml/quotes": "off",
  },
};
