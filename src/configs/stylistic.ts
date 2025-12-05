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
    "yml/file-extension": "error",
    "yml/require-string-key": "error",
    "yml/sort-keys": ["error", { order: { type: "asc" }, pathPattern: "^.*$" }],
    "yml/sort-sequence-values": [
      "error",
      { order: { type: "asc" }, pathPattern: "^.*$" },
    ],
  },
};
