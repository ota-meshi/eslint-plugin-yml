import { createRule } from "../utils"

export default createRule("block-sequence-hyphen-indicator-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks after `-` indicator",
            categories: null,
            extensionRule: false,
        },
        fixable: "whitespace",
        schema: [
            {
                enum: ["always", "never"],
            },
        ],
        messages: {
            unexpectedLinebreakAfterIndicator:
                "Unexpected line break after this `-` indicator.",
            expectedLinebreakAfterIndicator:
                "Expected a line break after this `-` indicator.",
        },
        type: "layout",
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        if (!context.parserServices.isYAML) {
            return {}
        }
        const option: "never" | "always" = context.options[0] || "never"

        return {
            YAMLSequence(node) {
                if (node.style !== "block") {
                    return
                }
                for (const entry of node.entries) {
                    if (!entry) {
                        continue
                    }
                    const hyphen = sourceCode.getTokenBefore(entry)
                    if (!hyphen) {
                        continue
                    }

                    const hasNewline =
                        hyphen.loc.end.line < entry.loc.start.line
                    if (hasNewline) {
                        if (option === "never") {
                            context.report({
                                loc: hyphen.loc,
                                messageId: "unexpectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaces = " ".repeat(
                                        Math.max(
                                            entry.loc.start.column -
                                                hyphen.loc.end.column,
                                            1,
                                        ),
                                    )
                                    return fixer.replaceTextRange(
                                        [hyphen.range[1], entry.range[0]],
                                        spaces,
                                    )
                                },
                            })
                        }
                    } else {
                        if (option === "always") {
                            context.report({
                                loc: hyphen.loc,
                                messageId: "expectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaces = `\n${" ".repeat(
                                        entry.loc.start.column,
                                    )}`
                                    return fixer.replaceTextRange(
                                        [hyphen.range[1], entry.range[0]],
                                        spaces,
                                    )
                                },
                            })
                        }
                    }
                }
            },
        }
    },
})
