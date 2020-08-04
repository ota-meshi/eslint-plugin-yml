import type { AST } from "yaml-eslint-parser"
import { createRule } from "../utils"
import type { YAMLNodeOrToken } from "../types"

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

const ALL_IRREGULARS = /[\f\v\u0085\ufeff\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u202f\u205f\u3000\u2028\u2029]/u
const IRREGULAR_WHITESPACE = /[\f\v\u0085\ufeff\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u202f\u205f\u3000]+/gmu
const IRREGULAR_LINE_TERMINATORS = /[\u2028\u2029]/gmu

export default createRule("no-irregular-whitespace", {
    meta: {
        docs: {
            description: "disallow irregular whitespace",
            categories: ["recommended"],
            extensionRule: true,
        },
        schema: [
            {
                type: "object",
                properties: {
                    skipComments: {
                        type: "boolean",
                        default: false,
                    },
                    skipQuotedScalars: {
                        type: "boolean",
                        default: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            disallow: "Irregular whitespace not allowed.",
        },
        type: "problem",
    },
    create(context) {
        // Module store of error indexes that we have found
        let errorIndexes: number[] = []

        // Lookup the `skipComments` option, which defaults to `false`.
        const options = context.options[0] || {}
        const skipComments = Boolean(options.skipComments)
        const skipQuotedScalars = options.skipQuotedScalars !== false

        const sourceCode = context.getSourceCode()

        /**
         * Removes errors that occur inside a string node
         * @param node to check for matching errors.
         * @private
         */
        function removeWhitespaceError(node: YAMLNodeOrToken) {
            const [startIndex, endIndex] = node.range

            errorIndexes = errorIndexes.filter(
                (errorIndex) =>
                    errorIndex < startIndex || endIndex <= errorIndex,
            )
        }

        /**
         * Checks scalar nodes for errors that we are choosing to ignore and calls the relevant methods to remove the errors
         * @param node to check for matching errors.
         * @returns {void}
         * @private
         */
        function removeInvalidNodeErrorsInScalar(node: AST.YAMLScalar) {
            if (
                skipQuotedScalars &&
                (node.style === "double-quoted" ||
                    node.style === "single-quoted")
            ) {
                // If we have irregular characters remove them from the errors list
                if (ALL_IRREGULARS.test(sourceCode.getText(node))) {
                    removeWhitespaceError(node)
                }
            }
        }

        /**
         * Checks comment nodes for errors that we are choosing to ignore and calls the relevant methods to remove the errors
         * @param node to check for matching errors.
         * @private
         */
        function removeInvalidNodeErrorsInComment(node: AST.Comment) {
            if (ALL_IRREGULARS.test(node.value)) {
                removeWhitespaceError(node)
            }
        }

        /**
         * Checks the program source for irregular whitespaces and irregular line terminators
         * @returns {void}
         * @private
         */
        function checkForIrregularWhitespace() {
            const source = sourceCode.getText()
            let match
            while ((match = IRREGULAR_WHITESPACE.exec(source)) !== null) {
                errorIndexes.push(match.index)
            }
            while ((match = IRREGULAR_LINE_TERMINATORS.exec(source)) !== null) {
                errorIndexes.push(match.index)
            }
        }

        checkForIrregularWhitespace()

        if (!errorIndexes.length) {
            return {}
        }
        return {
            YAMLScalar: removeInvalidNodeErrorsInScalar,
            "Program:exit"() {
                if (skipComments) {
                    // First strip errors occurring in comment nodes.
                    sourceCode
                        .getAllComments()
                        .forEach(removeInvalidNodeErrorsInComment)
                }

                // If we have any errors remaining report on them
                for (const errorIndex of errorIndexes) {
                    context.report({
                        loc: sourceCode.getLocFromIndex(errorIndex),
                        messageId: "disallow",
                    })
                }
            },
        }
    },
})
