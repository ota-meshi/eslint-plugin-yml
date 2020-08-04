import coreRule from "eslint/lib/rules/array-bracket-spacing"
import { createRule, defineWrapperListener, getProxyNode } from "../utils"

export default createRule("flow-sequence-bracket-spacing", {
    meta: {
        docs: {
            description:
                "enforce consistent spacing inside flow sequence brackets",
            categories: null,
            extensionRule: "array-bracket-spacing",
        },
        fixable: coreRule.meta!.fixable,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        if (!context.parserServices.isYAML) {
            return {}
        }

        return defineWrapperListener(coreRule, context, {
            options: context.options,
            createListenerProxy(listener) {
                return {
                    YAMLSequence(node) {
                        if (node.style === "flow") {
                            listener.ArrayExpression(
                                getProxyNode(node, {
                                    type: "ArrayExpression",
                                    get elements() {
                                        return node.entries
                                    },
                                }),
                            )
                        }
                    },
                }
            },
        })
    },
})
