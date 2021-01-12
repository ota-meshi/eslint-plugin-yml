import type { RuleContext } from "../types"
import { createRule } from "../utils"

export default createRule("no-tab-indent", {
    meta: {
        docs: {
            description: "disallow tabs for indentation.",
            categories: ["recommended", "standard"],
            extensionRule: false,
        },
        schema: [],
        messages: {
            disallow: "Unexpected tabs.",
        },
        type: "problem",
    },
    create(context: RuleContext) {
        if (!context.parserServices.isYAML) {
            return {}
        }
        return {
            Program() {
                const sourceCode = context.getSourceCode()
                const lines = sourceCode.lines
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex]
                    const res = /^([^\S\t]*(?:-[^\S\t]+)?)\t+/u.exec(line)
                    if (res) {
                        context.report({
                            loc: {
                                start: {
                                    line: lineIndex + 1,
                                    column: res[1].length,
                                },
                                end: {
                                    line: lineIndex + 1,
                                    column: res[0].length,
                                },
                            },
                            messageId: "disallow",
                        })
                    }
                }
            },
        }
    },
})
