import path from "path";
const base = require.resolve("./base");
const baseExtend = path.extname(`${base}`) === ".ts" ? "plugin:yml/base" : base;
export = {
  extends: [baseExtend],
  rules: {
    // eslint-plugin-yml rules
    "yml/block-mapping-question-indicator-newline": "error",
    "yml/block-mapping": "error",
    "yml/block-sequence-hyphen-indicator-newline": "error",
    "yml/block-sequence": "error",
    "yml/flow-mapping-curly-newline": "error",
    "yml/flow-mapping-curly-spacing": "error",
    "yml/flow-sequence-bracket-newline": "error",
    "yml/flow-sequence-bracket-spacing": "error",
    "yml/indent": "error",
    "yml/key-spacing": "error",
    "yml/no-empty-document": "error",
    "yml/no-empty-key": "error",
    "yml/no-empty-mapping-value": "error",
    "yml/no-empty-sequence-entry": "error",
    "yml/no-irregular-whitespace": "error",
    "yml/no-tab-indent": "error",
    "yml/plain-scalar": "error",
    "yml/quotes": "error",
    "yml/spaced-comment": "error",
    "yml/vue-custom-block/no-parsing-error": "error",
  },
};
