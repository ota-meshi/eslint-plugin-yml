import type { RuleFixer, SourceCode } from "../types"
import naturalCompare from "natural-compare"
import type { AST } from "yaml-eslint-parser"
import { createRule } from "../utils"
import { isComma } from "../utils/ast-utils"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

type UserOptions = CompatibleWithESLintOptions | PatternOption[]

type OrderTypeOption = "asc" | "desc"
type CompatibleWithESLintOptions =
    | []
    | [OrderTypeOption]
    | [
          OrderTypeOption,
          {
              caseSensitive?: boolean
              natural?: boolean
              minKeys?: number
          },
      ]
type PatternOption = {
    pathPattern: string
    hasProperties: string[]
    order:
        | {
              type?: OrderTypeOption
              caseSensitive?: boolean
              natural?: boolean
          }
        | string[]
    minKeys?: number
}
type ParsedOption = {
    isTargetMapping: (node: AST.YAMLMapping) => boolean
    ignore: (s: string) => boolean
    isValidOrder: Validator
    minKeys: number
    orderText: string
}
type Validator = (a: string, b: string) => boolean

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
 * Check if given options are CompatibleWithESLintOptions
 */
function isCompatibleWithESLintOptions(
    options: UserOptions,
): options is CompatibleWithESLintOptions {
    if (options.length === 0) {
        return true
    }
    if (typeof options[0] === "string" || options[0] == null) {
        return true
    }

    return false
}

/**
 * Build function which check that the given 2 names are in specific order.
 */
function buildValidatorFromType(
    order: OrderTypeOption,
    insensitive: boolean,
    natural: boolean,
): Validator {
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

/**
 * Parse options
 */
function parseOptions(
    options: UserOptions,
    sourceCode: SourceCode,
): ParsedOption[] {
    if (isCompatibleWithESLintOptions(options)) {
        const type: OrderTypeOption = options[0] ?? "asc"
        const obj = options[1] ?? {}
        const insensitive = obj.caseSensitive === false
        const natural = Boolean(obj.natural)
        const minKeys: number = obj.minKeys ?? 2
        return [
            {
                isTargetMapping: () => true, // all
                ignore: () => false,
                isValidOrder: buildValidatorFromType(
                    type,
                    insensitive,
                    natural,
                ),
                minKeys,
                orderText: `${natural ? "natural " : ""}${
                    insensitive ? "insensitive " : ""
                }${type}ending`,
            },
        ]
    }

    return options.map((opt) => {
        const order = opt.order
        const pathPattern = new RegExp(opt.pathPattern)
        const hasProperties = opt.hasProperties ?? []
        const minKeys: number = opt.minKeys ?? 2
        if (!Array.isArray(order)) {
            const type: OrderTypeOption = order.type ?? "asc"
            const insensitive = order.caseSensitive === false
            const natural = Boolean(order.natural)

            return {
                isTargetMapping,
                ignore: () => false,
                isValidOrder: buildValidatorFromType(
                    type,
                    insensitive,
                    natural,
                ),
                minKeys,
                orderText: `${natural ? "natural " : ""}${
                    insensitive ? "insensitive " : ""
                }${type}ending`,
            }
        }
        return {
            isTargetMapping,
            ignore: (s) => !order.includes(s),
            isValidOrder(a, b) {
                const aIndex = order.indexOf(a)
                const bIndex = order.indexOf(b)
                return aIndex <= bIndex
            },
            minKeys,
            orderText: "specified",
        }

        /**
         * Checks whether given node is verify target
         */
        function isTargetMapping(node: AST.YAMLMapping) {
            if (hasProperties.length > 0) {
                const names = new Set(
                    node.pairs.map((p) => getPropertyName(p, sourceCode)),
                )
                if (!hasProperties.every((name) => names.has(name))) {
                    return false
                }
            }

            let path = ""
            let curr: AST.YAMLNode = node
            let p: AST.YAMLNode | null = curr.parent
            while (p) {
                if (p.type === "YAMLPair") {
                    const name = getPropertyName(p, sourceCode)
                    if (/^[$_a-z][\w$]*$/iu.test(name)) {
                        path = `.${name}${path}`
                    } else {
                        path = `[${name}]${path}`
                    }
                } else if (p.type === "YAMLSequence") {
                    const index = p.entries.indexOf(curr as never)
                    path = `[${index}]${path}`
                }
                curr = p
                p = curr.parent
            }
            if (path.startsWith(".")) {
                path = path.slice(1)
            }
            return pathPattern.test(path)
        }
    })
}

const allowOrderTypes: OrderTypeOption[] = ["asc", "desc"]

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

        schema: {
            oneOf: [
                {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            pathPattern: { type: "string" },
                            hasProperties: {
                                type: "array",
                                items: { type: "string" },
                            },
                            order: {
                                oneOf: [
                                    {
                                        type: "array",
                                        items: { type: "string" },
                                        uniqueItems: true,
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            type: {
                                                enum: allowOrderTypes,
                                            },
                                            caseSensitive: {
                                                type: "boolean",
                                            },
                                            natural: {
                                                type: "boolean",
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                ],
                            },
                            minKeys: {
                                type: "integer",
                                minimum: 2,
                            },
                        },
                        required: ["pathPattern", "order"],
                        additionalProperties: false,
                    },
                    minItems: 1,
                },
                // For options compatible with the ESLint core.
                {
                    type: "array",
                    items: [
                        {
                            enum: allowOrderTypes,
                        },
                        {
                            type: "object",
                            properties: {
                                caseSensitive: {
                                    type: "boolean",
                                },
                                natural: {
                                    type: "boolean",
                                },
                                minKeys: {
                                    type: "integer",
                                    minimum: 2,
                                },
                            },
                            additionalProperties: false,
                        },
                    ],
                    additionalItems: false,
                },
            ],
        },
        messages: {
            sortKeys:
                "Expected mapping keys to be in {{orderText}} order. '{{thisName}}' should be before '{{prevName}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        if (!context.parserServices.isYAML) {
            return {}
        }
        // Parse options.
        const parsedOptions = parseOptions(context.options, sourceCode)

        type PairData = {
            name: string
            node: AST.YAMLPair
            anchors: Set<string>
            aliases: Set<string>
        }
        type MappingStack = {
            upper: MappingStack | null
            prevList: PairData[]
            numKeys: number
            option: ParsedOption | null
        }
        let mappingStack: MappingStack = {
            upper: null,
            prevList: [],
            numKeys: 0,
            option: null,
        }

        type PairStack = {
            upper: PairStack | null
            anchors: Set<string>
            aliases: Set<string>
        }
        let pairStack: PairStack = {
            upper: null,
            anchors: new Set<string>(),
            aliases: new Set<string>(),
        }

        /**
         * Check order
         */
        function isValidOrder(
            prevData: PairData,
            thisData: PairData,
            option: ParsedOption,
        ) {
            if (option.isValidOrder(prevData.name, thisData.name)) {
                return true
            }

            for (const aliasName of thisData.aliases) {
                if (prevData.anchors.has(aliasName)) {
                    // The current order is correct for handling anchors.
                    return true
                }
            }
            for (const anchorName of thisData.anchors) {
                if (prevData.aliases.has(anchorName)) {
                    // The current order is correct for handling anchors.
                    return true
                }
            }
            return false
        }

        return {
            YAMLMapping(node: AST.YAMLMapping) {
                mappingStack = {
                    upper: mappingStack,
                    prevList: [],
                    numKeys: node.pairs.length,
                    option:
                        parsedOptions.find((o) => o.isTargetMapping(node)) ||
                        null,
                }
            },

            "YAMLMapping:exit"() {
                mappingStack = mappingStack.upper!
            },
            YAMLPair() {
                pairStack = {
                    upper: pairStack,
                    anchors: new Set<string>(),
                    aliases: new Set<string>(),
                }
            },
            YAMLAnchor(node: AST.YAMLAnchor) {
                if (pairStack) {
                    pairStack.anchors.add(node.name)
                }
            },
            YAMLAlias(node: AST.YAMLAlias) {
                if (pairStack) {
                    pairStack.aliases.add(node.name)
                }
            },
            "YAMLPair:exit"(node: AST.YAMLPair) {
                const { anchors, aliases } = pairStack
                pairStack = pairStack.upper!
                pairStack.anchors = new Set([...pairStack.anchors, ...anchors])
                pairStack.aliases = new Set([...pairStack.aliases, ...aliases])
                if (!node.key && !node.value) {
                    // ignore
                    return
                }
                const option = mappingStack.option
                if (!option) {
                    return
                }
                const thisName = getPropertyName(node, sourceCode)
                if (option.ignore(thisName)) {
                    return
                }
                const prevList = mappingStack.prevList
                const numKeys = mappingStack.numKeys
                const thisData = {
                    name: thisName,
                    node,
                    anchors,
                    aliases,
                }

                mappingStack.prevList = [thisData, ...prevList]
                if (prevList.length === 0 || numKeys < option.minKeys) {
                    return
                }

                if (!isValidOrder(prevList[0], thisData, option)) {
                    context.report({
                        loc: node.key?.loc ?? node.loc,
                        messageId: "sortKeys",
                        data: {
                            thisName,
                            prevName: prevList[0].name,
                            orderText: option.orderText,
                        },
                        *fix(fixer) {
                            let moveTarget = prevList[0].node
                            for (const prev of prevList) {
                                if (isValidOrder(prev, thisData, option)) {
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
