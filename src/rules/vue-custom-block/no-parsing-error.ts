import type { AST } from "yaml-eslint-parser"
import { createRule } from "../../utils"

export default createRule("vue-custom-block/no-parsing-error", {
    meta: {
        docs: {
            description: "disallow parsing errors in Vue custom blocks",
            categories: ["recommended"],
            extensionRule: false,
        },
        schema: [],
        messages: {},
        type: "problem",
    },
    create(context, { customBlock }) {
        if (!customBlock) {
            return {}
        }
        const parseError = context.parserServices.parseError
        if (parseError) {
            let loc: AST.Position | undefined = undefined
            if ("column" in parseError && "lineNumber" in parseError) {
                loc = {
                    line: parseError.lineNumber,
                    column: parseError.column,
                }
            }
            return {
                Program(node) {
                    context.report({
                        node,
                        loc,
                        message: parseError.message,
                    })
                },
            }
        }
        return {}
    },
})
