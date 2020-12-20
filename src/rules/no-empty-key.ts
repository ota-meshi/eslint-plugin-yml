import type { AST } from "yaml-eslint-parser"
import { createRule } from "../utils"

export default createRule("no-empty-key", {
    meta: {
        docs: {
            description: "disallow empty mapping keys",
            categories: ["recommended"],
            extensionRule: false,
        },
        schema: [],
        messages: {
            unexpectedEmpty: "Empty mapping keys are forbidden.",
        },
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isYAML) {
            return {}
        }

        /**
         * Checks if the given node is empty
         */
        function isEmptyNode(
            node: AST.YAMLContent | AST.YAMLWithMeta | null,
        ): boolean {
            if (!node) {
                return true
            }
            if (node.type === "YAMLWithMeta") {
                return isEmptyNode(node.value)
            }

            return false
        }

        return {
            YAMLPair(node) {
                if (isEmptyNode(node.key)) {
                    context.report({
                        node,
                        messageId: "unexpectedEmpty",
                    })
                }
            },
        }
    },
})
