import path from "path"
import fs from "fs"
import os from "os"
// import eslint from "eslint"
import { rules } from "./lib/load-rules"
const isWin = os.platform().startsWith("win")

const RULESET_NAME = {
    recommended: "../src/configs/recommended.ts",
}

for (const rec of ["recommended"] as const) {
    let content = `
import path from "path"
const base = require.resolve("./base")
const baseExtend =
    path.extname(\`\${base}\`) === ".ts" ? "plugin:yml/base" : base
export = {
    extends: [baseExtend],
    rules: {
        // eslint-plugin-yml rules
        ${rules
            .filter(
                (rule) =>
                    rule.meta.docs.categories &&
                    !rule.meta.deprecated &&
                    rule.meta.docs.categories.includes(rec),
            )
            .map((rule) => {
                const conf = rule.meta.docs.default || "error"
                return `"${rule.meta.docs.ruleId}": "${conf}"`
            })
            .join(",\n")}
    },
}
`

    const filePath = path.resolve(__dirname, RULESET_NAME[rec])

    if (isWin) {
        content = content
            .replace(/\r?\n/gu, "\n")
            .replace(/\r/gu, "\n")
            .replace(/\n/gu, "\r\n")
    }

    // Update file.
    fs.writeFileSync(filePath, content)
}
