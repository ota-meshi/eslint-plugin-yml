import type { RuleFixer, SourceCode } from "../types"
import naturalCompare from "natural-compare"
import type { AST } from "yaml-eslint-parser"
import { createRule } from "../utils"
import { isComma } from "../utils/ast-utils"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks whether the given string is new line.
 */
function isNewLine(char: string) {
    return (
        char === "\n" || char === "\r" || char === "\u2028" || char === "\u2029"
    )
}

/**
 * Gets the property name of the given `YAMLPair` node.
 */
function getPropertyName(node: AST.YAMLPair, sourceCode: SourceCode): string {
    const prop = node.key
    if (prop == null) {
        return ""
    }
    const target = prop.type === "YAMLWithMeta" ? prop.value : prop
    if (target == null) {
        return ""
    }
    if (target.type === "YAMLScalar" && typeof target.value === "string") {
        return target.value
    }
    return sourceCode.text.slice(...target.range)
}

/**
 * Build function which check that the given 2 names are in specific order.
 */
function buildValidator(order: Option, insensitive: boolean, natural: boolean) {
    let compare = natural
        ? ([a, b]: string[]) => naturalCompare(a, b) <= 0
        : ([a, b]: string[]) => a <= b
    if (insensitive) {
        const baseCompare = compare
        compare = ([a, b]: string[]) =>
            baseCompare([a.toLowerCase(), b.toLowerCase()])
    }
    if (order === "desc") {
        const baseCompare = compare
        compare = (args: string[]) => baseCompare(args.reverse())
    }
    return (a: string, b: string) => compare([a, b])
}

const allowOptions = ["asc", "desc"] as const
type Option = typeof allowOptions[number]

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule("sort-keys", {
    meta: {
        docs: {
            description: "require mapping keys to be sorted",
            categories: null,
            extensionRule: "sort-keys",
        },
        fixable: "code",
        schema: [
            {
                enum: allowOptions,
            },
            {
                type: "object",
                properties: {
                    caseSensitive: {
                        type: "boolean",
                        default: true,
                    },
                    natural: {
                        type: "boolean",
                        default: false,
                    },
                    minKeys: {
                        type: "integer",
                        minimum: 2,
                        default: 2,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            sortKeys:
                "Expected mapping keys to be in {{natural}}{{insensitive}}{{order}}ending order. '{{thisName}}' should be before '{{prevName}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        if (!context.parserServices.isYAML) {
            return {}
        }
        // Parse options.
        const order: Option = context.options[0] || "asc"
        const options = context.options[1]
        const insensitive: boolean = options && options.caseSensitive === false
        const natural: boolean = options && options.natural
        const minKeys: number = options && options.minKeys
        const orderValidator = buildValidator(order, insensitive, natural)

        type Stack = {
            upper: Stack | null
            prevList: { name: string; node: AST.YAMLPair }[]
            numKeys: number
            curPair?: {
                node: AST.YAMLPair
                aliases: string[]
            }
        }
        let stack: Stack = { upper: null, prevList: [], numKeys: 0 }

        let anchors: Record<string, AST.YAMLAnchor[]> = {}

        /**
         * Check order
         */
        function isValidOrder(
            prevData: { name: string; node: AST.YAMLPair },
            thisData: { name: string; node: AST.YAMLPair },
        ) {
            if (orderValidator(prevData.name, thisData.name)) {
                return true
            }

            if (stack.curPair && stack.curPair.node === thisData.node) {
                for (const aliasName of stack.curPair.aliases) {
                    for (const anchor of anchors[aliasName] || []) {
                        if (
                            prevData.node.range[0] <= anchor.range[0] &&
                            anchor.range[1] <= prevData.node.range[1]
                        ) {
                            // The current order is correct for handling anchors.
                            return true
                        }
                    }
                }
            }
            return false
        }

        return {
            YAMLDocument() {
                anchors = {}
            },
            YAMLAnchor(node: AST.YAMLAnchor) {
                const list = anchors[node.name] || (anchors[node.name] = [])
                list.push(node)
            },
            YAMLMapping(node: AST.YAMLMapping) {
                stack = {
                    upper: stack,
                    prevList: [],
                    numKeys: node.pairs.length,
                }
            },

            "YAMLMapping:exit"() {
                stack = stack.upper!
            },
            YAMLPair(node: AST.YAMLPair) {
                stack.curPair = { node, aliases: [] }
            },
            YAMLAlias(node: AST.YAMLAlias) {
                if (stack.curPair) {
                    stack.curPair.aliases.push(node.name)
                }
            },
            "YAMLPair:exit"(node: AST.YAMLPair) {
                if (!node.key && !node.value) {
                    // ignore
                    return
                }
                const prevList = stack.prevList
                const numKeys = stack.numKeys
                const thisName = getPropertyName(node, sourceCode)
                const thisData = {
                    name: thisName,
                    node,
                }

                stack.prevList = [thisData, ...prevList]
                if (prevList.length === 0 || numKeys < minKeys) {
                    return
                }

                if (!isValidOrder(prevList[0], thisData)) {
                    context.report({
                        loc: node.key?.loc ?? node.loc,
                        messageId: "sortKeys",
                        data: {
                            thisName,
                            prevName: prevList[0].name,
                            order,
                            insensitive: insensitive ? "insensitive " : "",
                            natural: natural ? "natural " : "",
                        },
                        *fix(fixer) {
                            let moveTarget = prevList[0].node
                            for (const prev of prevList) {
                                if (isValidOrder(prev, thisData)) {
                                    break
                                } else {
                                    moveTarget = prev.node
                                }
                            }

                            if (node.parent.style === "flow") {
                                yield* fixForFlow(fixer, node, moveTarget)
                            } else {
                                yield* fixForBlock(fixer, node, moveTarget)
                            }
                        },
                    })
                }
            },
        }

        /**
         * Fix for flow
         */
        function* fixForFlow(
            fixer: RuleFixer,
            node: AST.YAMLPair,
            moveTarget: AST.YAMLPair,
        ) {
            const beforeCommaToken = sourceCode.getTokenBefore(node)!
            let insertCode: string,
                removeRange: AST.Range,
                insertTargetToken: AST.Token | AST.Comment

            const afterCommaToken = sourceCode.getTokenAfter(node)
            const moveTargetBeforeToken = sourceCode.getTokenBefore(moveTarget)!
            if (isComma(afterCommaToken)) {
                // e.g. |/**/ key: value,|
                removeRange = [
                    beforeCommaToken.range[1],
                    afterCommaToken.range[1],
                ]
                insertCode = sourceCode.text.slice(...removeRange)
                insertTargetToken = moveTargetBeforeToken
            } else {
                // e.g. |,/**/ key: value|
                removeRange = [beforeCommaToken.range[0], node.range[1]]
                if (isComma(moveTargetBeforeToken)) {
                    // { a: 1 , target : 2 , c : 3 }
                    //       ^ insert
                    insertCode = sourceCode.text.slice(...removeRange)
                    insertTargetToken = sourceCode.getTokenBefore(
                        moveTargetBeforeToken,
                    )!
                } else {
                    // { target: 1 , b : 2 , c : 3 }
                    //  ^ insert
                    insertCode = `${sourceCode.text.slice(
                        beforeCommaToken.range[1],
                        node.range[1],
                    )},`
                    insertTargetToken = moveTargetBeforeToken
                }
            }
            yield fixer.insertTextAfterRange(
                insertTargetToken.range,
                insertCode,
            )

            yield fixer.removeRange(removeRange)
        }

        /**
         * Fix for block
         */
        function* fixForBlock(
            fixer: RuleFixer,
            node: AST.YAMLPair,
            moveTarget: AST.YAMLPair,
        ) {
            const nodeLocs = getPairRangeForBlock(node)
            const moveTargetLocs = getPairRangeForBlock(moveTarget)

            if (moveTargetLocs.loc.start.column === 0) {
                const removeRange: AST.Range = [
                    getNewlineStartIndex(nodeLocs.range[0]),
                    nodeLocs.range[1],
                ]
                const moveTargetRange: AST.Range = [
                    getNewlineStartIndex(moveTargetLocs.range[0]),
                    moveTargetLocs.range[1],
                ]

                const insertCode = sourceCode.text.slice(...removeRange)
                yield fixer.insertTextBeforeRange(
                    moveTargetRange,
                    `${insertCode}${
                        moveTargetLocs.loc.start.line === 1 ? "\n" : ""
                    }`,
                )

                yield fixer.removeRange(removeRange)
            } else {
                // e.g.
                // | - a: 1
                // |   b: 2
                const diffIndent =
                    nodeLocs.indentColumn - moveTargetLocs.indentColumn

                const insertCode = `${sourceCode.text.slice(
                    nodeLocs.range[0] + diffIndent,
                    nodeLocs.range[1],
                )}\n${sourceCode.text.slice(
                    nodeLocs.range[0],
                    nodeLocs.range[0] + diffIndent,
                )}`
                yield fixer.insertTextBeforeRange(
                    moveTargetLocs.range,
                    `${insertCode}${
                        moveTargetLocs.loc.start.line === 1 ? "\n" : ""
                    }`,
                )

                const removeRange: AST.Range = [
                    getNewlineStartIndex(nodeLocs.range[0]),
                    nodeLocs.range[1],
                ]
                yield fixer.removeRange(removeRange)
            }
        }

        /**
         * Get start index of newline
         */
        function getNewlineStartIndex(nextIndex: number): number {
            for (let index = nextIndex; index >= 0; index--) {
                const char = sourceCode.text[index]
                if (isNewLine(sourceCode.text[index])) {
                    const prev = sourceCode.text[index - 1]
                    if (prev === "\r" && char === "\n") {
                        return index - 1
                    }
                    return index
                }
            }
            return 0
        }

        /**
         * Get range from given pair
         */
        function getPairRangeForBlock(
            node: AST.YAMLPair,
        ): {
            loc: AST.SourceLocation
            range: AST.Range
            indentColumn: number
        } {
            let endOfRange: number, end: AST.Position
            if (node.loc.end.column > 0) {
                const afterToken = sourceCode.getTokenAfter(node)
                if (
                    !afterToken ||
                    node.loc.end.line < afterToken.loc.start.line
                ) {
                    const line = sourceCode.lines[node.loc.end.line - 1]
                    end = {
                        line: node.loc.end.line,
                        column: line.length,
                    }
                    endOfRange = sourceCode.getIndexFromLoc(end)
                } else {
                    endOfRange = node.range[1]
                    end = node.loc.end
                }
            } else {
                endOfRange = getNewlineStartIndex(node.range[1])
                end = sourceCode.getLocFromIndex(endOfRange)
            }

            const beforeToken = sourceCode.getTokenBefore(node)
            if (beforeToken) {
                const next = sourceCode.getTokenAfter(beforeToken, {
                    includeComments: true,
                })!
                if (beforeToken.loc.end.line < next.loc.start.line) {
                    const start = {
                        line: next.loc.start.line,
                        column: 0,
                    }
                    const startOfRange = sourceCode.getIndexFromLoc(start)
                    return {
                        range: [startOfRange, endOfRange],
                        loc: { start, end },
                        indentColumn: next.loc.start.column,
                    }
                }
                if (beforeToken.loc.end.line < node.loc.start.line) {
                    const start = {
                        line: node.loc.start.line,
                        column: 0,
                    }
                    const startOfRange = sourceCode.getIndexFromLoc(start)
                    return {
                        range: [startOfRange, endOfRange],
                        loc: { start, end },
                        indentColumn: next.loc.start.column,
                    }
                }
                const start = beforeToken.loc.end
                const startOfRange = beforeToken.range[1]
                return {
                    range: [startOfRange, endOfRange],
                    loc: { start, end },
                    indentColumn: node.range[0] - beforeToken.range[1],
                }
            }
            let next: AST.Token | AST.Comment | AST.YAMLPair = node
            for (const beforeComment of sourceCode
                .getTokensBefore(node, {
                    includeComments: true,
                })
                .reverse()) {
                if (beforeComment.loc.end.line + 1 < next.loc.start.line) {
                    const start = {
                        line: next.loc.start.line,
                        column: 0,
                    }
                    const startOfRange = sourceCode.getIndexFromLoc(start)
                    return {
                        range: [startOfRange, endOfRange],
                        loc: { start, end },
                        indentColumn: next.loc.start.column,
                    }
                }
                next = beforeComment
            }
            const start = {
                line: node.loc.start.line,
                column: 0,
            }
            const startOfRange = sourceCode.getIndexFromLoc(start)
            return {
                range: [startOfRange, endOfRange],
                loc: { start, end },
                indentColumn: node.loc.start.column,
            }
        }
    },
})
