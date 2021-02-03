import { getStaticYAMLValue, parseForESLint } from "yaml-eslint-parser"
import type { AST } from "yaml-eslint-parser"
import { createRule } from "../utils"

const SYMBOLS = new Set([
    // mapping
    // "?",
    ":",
    "{",
    "}",
    // sequence
    // "-",
    "[",
    "]",
    ",",
    // anchor
    "&",
    "*",
    // comment
    "#",
    // literal
    "|",
    "+",
    // tags
    // "!",
    // "<",
    // ">",
    // directives
    "%",
    // quoted
    '"',
    "'",
    "\\",
])

export default createRule("plain-scalar", {
    meta: {
        docs: {
            description: "require or disallow plain style scalar.",
            categories: ["standard"],
            extensionRule: false,
        },
        fixable: "code",
        schema: [{ enum: ["always", "never"] }],
        messages: {
            required: "Must use plain style scalar.",
            disallow: "Must use quoted style scalar.",
        },
        type: "layout",
    },
    create(context) {
        if (!context.parserServices.isYAML) {
            return {}
        }
        const option: "always" | "never" = context.options[0] || "always"

        const sourceCode = context.getSourceCode()

        /* eslint-disable complexity -- X( */
        /**
         * Check if it can be converted to plain.
         */
        function canToPlain(
            /* eslint-enable complexity -- X( */
            node: AST.YAMLDoubleQuotedScalar | AST.YAMLSingleQuotedScalar,
        ) {
            if (node.value !== node.value.trim()) {
                return false
            }
            for (let index = 0; index < node.value.length; index++) {
                const char = node.value[index]
                if (SYMBOLS.has(char)) {
                    return false
                }
                if (index === 0) {
                    if (char === "-" || char === "?") {
                        const next = node.value[index + 1]
                        if (next && !next.trim()) {
                            // "-" indicator or "?" indicator
                            return false
                        }
                    } else if (char === "!") {
                        const next = node.value[index + 1]
                        if (
                            next &&
                            (!next.trim() || next === "!" || next === "<")
                        ) {
                            // "!" indicator
                            return false
                        }
                    }
                }
            }
            const parent =
                node.parent.type === "YAMLWithMeta"
                    ? node.parent.parent
                    : node.parent

            if (parent.type === "YAMLPair") {
                if (parent.key === node) {
                    const colon = sourceCode.getTokenAfter(node)
                    if (colon && colon.value === ":") {
                        const next = sourceCode.getTokenAfter(colon)
                        if (colon.range[1] === next?.range[0]) {
                            // e.g. {"target":b}
                            return false
                        }
                    }
                }
            }
            return true
        }

        /**
         * Verify node for `always`
         */
        function verifyAlways(node: AST.YAMLScalar) {
            if (
                node.style !== "double-quoted" &&
                node.style !== "single-quoted"
            ) {
                return
            }

            if (!canToPlain(node)) {
                return
            }

            try {
                const result = parseForESLint(node.value)
                if (getStaticYAMLValue(result.ast) !== node.value) {
                    return
                }
            } catch {
                return
            }

            context.report({
                node,
                messageId: "required",
                fix(fixer) {
                    return fixer.replaceText(node, node.value)
                },
            })
        }

        /**
         * Verify node for `never`
         */
        function verifyNever(node: AST.YAMLScalar) {
            if (node.style !== "plain" || typeof node.value !== "string") {
                return
            }

            const text = node.value

            context.report({
                node,
                messageId: "disallow",
                fix(fixer) {
                    return fixer.replaceText(
                        node,
                        `"${text
                            .replace(/([\\"])/gu, "\\$1")
                            .replace(/\r?\n|[\u2028\u2029]/gu, "\\n")}"`,
                    )
                },
            })
        }

        return {
            YAMLScalar: option === "always" ? verifyAlways : verifyNever,
        }
    },
})
