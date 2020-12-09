import path from "path"
const base = require.resolve("./base")
const baseExtend = path.extname(`${base}`) === ".ts" ? "plugin:yml/base" : base
export = {
    extends: [baseExtend],
    rules: {
        // eslint-plugin-yml rules
        "yml/no-irregular-whitespace": "error",
        "yml/no-parsing-error-in-vue-custom-block": "error",
        "yml/no-tab-indent": "error",
    },
}
