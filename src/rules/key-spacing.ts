//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import type { AST } from "yaml-eslint-parser"
import type { RuleListener, RuleContext } from "../types"
import { createRule } from "../utils"
import { isColon, isQuestion } from "../utils/ast-utils"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

type YAMLKeyValuePair = AST.YAMLPair & {
    key: AST.YAMLContent | AST.YAMLWithMeta
    value: AST.YAMLContent | AST.YAMLWithMeta
}

/**
 * Checks whether a string contains a line terminator as defined in
 * http://www.ecma-international.org/ecma-262/5.1/#sec-7.3
 * @param {string} str String to test.
 * @returns {boolean} True if str contains a line terminator.
 */
function containsLineTerminator(str: string): boolean {
    return /[\r\n\u2028\u2029]/u.test(str)
}

/**
 * Gets the last element of an array.
 * @param {Array} arr An array.
 * @returns {any} Last element of arr.
 */
function last<T>(arr: T[]): T {
    return arr[arr.length - 1]
}

/**
 * Checks whether a node is contained on a single line.
 * @param {ASTNode} node AST Node being evaluated.
 * @returns {boolean} True if the node is a single line.
 */
function isSingleLine(node: AST.YAMLNode): boolean {
    return node.loc.end.line === node.loc.start.line
}

/**
 * Checks whether the properties on a single line.
 * @param {ASTNode[]} properties List of Property AST nodes.
 * @returns {boolean} True if all properties is on a single line.
 */
function isSingleLineProperties(properties: YAMLKeyValuePair[]) {
    const [firstProp] = properties
    const lastProp = last(properties)

    return firstProp.loc.start.line === lastProp.loc.end.line
}

type AlignOption = {
    mode: "strict" | "minimum"
    on: "colon" | "value"
    beforeColon: boolean
    afterColon: boolean
}

type UserOption = {
    mode?: "strict" | "minimum"
    beforeColon?: boolean
    afterColon?: boolean
    align?: "colon" | "value" | AlignOption
}

type ParsedOption = {
    mode: "strict" | "minimum"
    beforeColon: boolean
    afterColon: boolean
    align: AlignOption | undefined
}

/**
 * Initializes a single option property from the configuration with defaults for undefined values
 * @param {Object} fromOptions Object to be initialized from
 * @returns {Object} The object with correctly initialized options and values
 */
function initOptionProperty(fromOptions: UserOption): ParsedOption {
    const mode = fromOptions.mode || "strict"

    let beforeColon: boolean, afterColon: boolean

    // Set value of beforeColon
    if (typeof fromOptions.beforeColon !== "undefined") {
        beforeColon = fromOptions.beforeColon
    } else {
        beforeColon = false
    }

    // Set value of afterColon
    if (typeof fromOptions.afterColon !== "undefined") {
        afterColon = fromOptions.afterColon
    } else {
        afterColon = true
    }

    let align: AlignOption | undefined = undefined
    // Set align if exists
    if (typeof fromOptions.align !== "undefined") {
        if (typeof fromOptions.align === "object") {
            align = fromOptions.align
        } else {
            // "string"
            align = {
                on: fromOptions.align,
                mode,
                beforeColon,
                afterColon,
            }
        }
    }

    return {
        mode,
        beforeColon,
        afterColon,
        align,
    }
}

/**
 * Initializes all the option values (singleLine, multiLine and align) from the configuration with defaults for undefined values
 * @param {Object} fromOptions Object to be initialized from
 * @returns {Object} The object with correctly initialized options and values
 */
function initOptions(
    fromOptions: {
        align?: Partial<AlignOption>
        multiLine?: UserOption
        singleLine?: UserOption
    } & UserOption,
) {
    let align: AlignOption | undefined,
        multiLine: ParsedOption,
        singleLine: ParsedOption

    if (typeof fromOptions.align === "object") {
        // Initialize the alignment configuration
        align = {
            ...initOptionProperty(fromOptions.align),
            on: fromOptions.align.on || "colon",
            mode: fromOptions.align.mode || "strict",
        }

        multiLine = initOptionProperty(fromOptions.multiLine || fromOptions)
        singleLine = initOptionProperty(fromOptions.singleLine || fromOptions)
    } else {
        // string or undefined
        multiLine = initOptionProperty(fromOptions.multiLine || fromOptions)
        singleLine = initOptionProperty(fromOptions.singleLine || fromOptions)

        // If alignment options are defined in multiLine, pull them out into the general align configuration
        if (multiLine.align) {
            align = {
                on: multiLine.align.on,
                mode: multiLine.align.mode || multiLine.mode,
                beforeColon: multiLine.align.beforeColon,
                afterColon: multiLine.align.afterColon,
            }
        }
    }

    return {
        align,
        multiLine,
        singleLine,
    }
}

const ON_SCHEMA = {
    enum: ["colon", "value"],
}
const PROPERTIES_SCHEMA = {
    mode: {
        enum: ["strict", "minimum"],
    },
    beforeColon: {
        type: "boolean",
    },
    afterColon: {
        type: "boolean",
    },
}

export default createRule("key-spacing", {
    meta: {
        docs: {
            description:
                "enforce consistent spacing between keys and values in mapping pairs",
            categories: null,
            extensionRule: "key-spacing",
        },
        fixable: "whitespace",
        schema: [
            {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            align: {
                                anyOf: [
                                    ON_SCHEMA,
                                    {
                                        type: "object",
                                        properties: {
                                            on: ON_SCHEMA,
                                            ...PROPERTIES_SCHEMA,
                                        },
                                        additionalProperties: false,
                                    },
                                ],
                            },
                            ...PROPERTIES_SCHEMA,
                        },
                        additionalProperties: false,
                    },
                    {
                        type: "object",
                        properties: {
                            singleLine: {
                                type: "object",
                                properties: {
                                    ...PROPERTIES_SCHEMA,
                                },
                                additionalProperties: false,
                            },
                            multiLine: {
                                type: "object",
                                properties: {
                                    align: {
                                        anyOf: [
                                            ON_SCHEMA,
                                            {
                                                type: "object",
                                                properties: {
                                                    on: ON_SCHEMA,
                                                    ...PROPERTIES_SCHEMA,
                                                },
                                                additionalProperties: false,
                                            },
                                        ],
                                    },
                                    ...PROPERTIES_SCHEMA,
                                },
                                additionalProperties: false,
                            },
                        },
                        additionalProperties: false,
                    },
                    {
                        type: "object",
                        properties: {
                            singleLine: {
                                type: "object",
                                properties: {
                                    ...PROPERTIES_SCHEMA,
                                },
                                additionalProperties: false,
                            },
                            multiLine: {
                                type: "object",
                                properties: {
                                    ...PROPERTIES_SCHEMA,
                                },
                                additionalProperties: false,
                            },
                            align: {
                                type: "object",
                                properties: {
                                    on: ON_SCHEMA,
                                    ...PROPERTIES_SCHEMA,
                                },
                                additionalProperties: false,
                            },
                        },
                        additionalProperties: false,
                    },
                ],
            },
        ],
        messages: {
            extraKey: "Extra space after key '{{key}}'.",
            extraValue: "Extra space before value for key '{{key}}'.",
            missingKey: "Missing space after key '{{key}}'.",
            missingValue: "Missing space before value for key '{{key}}'.",
        },
        type: "layout",
    },
    create,
})

/**
 * Create rule visitor
 */
function create(context: RuleContext): RuleListener {
    if (!context.parserServices.isYAML) {
        return {}
    }
    /**
     * OPTIONS
     * "key-spacing": [2, {
     *     beforeColon: false,
     *     afterColon: true,
     *     align: "colon" // Optional, or "value"
     * }
     */
    const options = context.options[0] || {}
    const {
        multiLine: multiLineOptions,
        singleLine: singleLineOptions,
        align: alignmentOptions,
    } = initOptions(options)

    const sourceCode = context.getSourceCode()

    /**
     * Determines if the given property is key-value property.
     * @param {ASTNode} property Property node to check.
     * @returns {boolean} Whether the property is a key-value property.
     */
    function isKeyValueProperty(
        property: AST.YAMLPair,
    ): property is YAMLKeyValuePair {
        return property.key != null && property.value != null
    }

    /**
     * Starting from the given a node (a property.key node here) looks forward
     * until it finds the last token before a colon punctuator and returns it.
     * @param {ASTNode} node The node to start looking from.
     * @returns {ASTNode} The last token before a colon punctuator.
     */
    function getLastTokenBeforeColon(node: YAMLKeyValuePair["key"]) {
        const colonToken = sourceCode.getTokenAfter(node, isColon)!

        return sourceCode.getTokenBefore(colonToken)!
    }

    /**
     * Starting from the given a node (a property.key node here) looks forward
     * until it finds the colon punctuator and returns it.
     * @param {ASTNode} node The node to start looking from.
     * @returns {ASTNode} The colon punctuator.
     */
    function getNextColon(node: YAMLKeyValuePair["key"]) {
        return sourceCode.getTokenAfter(node, isColon)!
    }

    /**
     * Gets an object literal property's key as the identifier name or string value.
     * @param {ASTNode} property Property node whose key to retrieve.
     * @returns {string} The property's key.
     */
    function getKey(property: YAMLKeyValuePair) {
        const key = property.key

        if (key.type !== "YAMLScalar") {
            return sourceCode.getText().slice(key.range[0], key.range[1])
        }
        return String(key.value)
    }

    /**
     * Checks if whitespace can be change.
     */
    function canChangeSpaces(
        property: YAMLKeyValuePair,
        side: "key" | "value",
    ): boolean {
        if (side === "value") {
            const before = sourceCode.getTokenBefore(property.key)
            if (
                isQuestion(before) &&
                property.key.loc.end.line < property.value.loc.start.line
            ) {
                // Need to leave the indent.
                return false
            }
        }
        return true
    }

    /* eslint-disable complexity -- ignore */
    /**
     * Checks if whitespace can be removed.
     */
    function canRemoveSpaces(
        /* eslint-enable complexity -- ignore */
        property: YAMLKeyValuePair,
        side: "key" | "value",
        whitespace: string,
    ): boolean {
        if (side === "key") {
            if (property.key.type === "YAMLAlias") {
                return false
            }
            if (
                property.key.type === "YAMLWithMeta" &&
                property.key.value == null
            ) {
                return false
            }
            if (property.parent.style === "block") {
                if (containsLineTerminator(whitespace)) {
                    const before = sourceCode.getTokenBefore(property.key)
                    if (isQuestion(before)) {
                        return false
                    }
                }
            }
        } else {
            // side === "value"
            if (property.parent.style === "block") {
                if (
                    property.parent.parent.type !== "YAMLSequence" ||
                    property.parent.parent.style !== "flow"
                ) {
                    return false
                }
            }
            const keyValue =
                property.key.type === "YAMLWithMeta"
                    ? property.key.value
                    : property.key
            if (!keyValue) {
                return false
            }
            if (keyValue.type === "YAMLScalar") {
                if (keyValue.style === "plain") {
                    return false
                }
            }
            if (keyValue.type === "YAMLAlias") {
                return false
            }
            if (
                property.value.type === "YAMLSequence" &&
                property.value.style === "block"
            ) {
                return false
            }
            if (containsLineTerminator(whitespace)) {
                if (
                    property.value.type === "YAMLMapping" &&
                    property.value.style === "block"
                ) {
                    return false
                }
            }
        }

        return true
    }

    /**
     * Checks if whitespace can be insert.
     */
    function canInsertSpaces(
        property: YAMLKeyValuePair,
        side: "key" | "value",
    ): boolean {
        if (side === "key") {
            if (property.key.type === "YAMLScalar") {
                if (
                    property.key.style === "plain" &&
                    typeof property.key.value === "string" &&
                    property.key.value.endsWith(":")
                ) {
                    return false
                }
            }
        }

        return true
    }

    /**
     * Reports an appropriately-formatted error if spacing is incorrect on one
     * side of the colon.
     * @param {ASTNode} property Key-value pair in an object literal.
     * @param {string} side Side being verified - either "key" or "value".
     * @param {string} whitespace Actual whitespace string.
     * @param {int} expected Expected whitespace length.
     * @param {string} mode Value of the mode as "strict" or "minimum"
     * @returns {void}
     */
    function report(
        property: YAMLKeyValuePair,
        side: "key" | "value",
        whitespace: string,
        expected: number,
        mode: "strict" | "minimum",
    ) {
        const diff = whitespace.length - expected
        const nextColon = getNextColon(property.key)
        const tokenBeforeColon = sourceCode.getTokenBefore(nextColon, {
            includeComments: true,
        })!
        const tokenAfterColon = sourceCode.getTokenAfter(nextColon, {
            includeComments: true,
        })!

        const invalid =
            (mode === "strict"
                ? diff !== 0
                : // mode === "minimum"
                  diff < 0 || (diff > 0 && expected === 0)) &&
            !(expected && containsLineTerminator(whitespace))

        if (!invalid) {
            return
        }
        if (
            !canChangeSpaces(property, side) ||
            (expected === 0 && !canRemoveSpaces(property, side, whitespace)) ||
            (whitespace.length === 0 && !canInsertSpaces(property, side))
        ) {
            return
        }
        const { locStart, locEnd, missingLoc } =
            side === "key"
                ? {
                      locStart: tokenBeforeColon.loc.end,
                      locEnd: nextColon.loc.start,
                      missingLoc: tokenBeforeColon.loc,
                  }
                : {
                      locStart: nextColon.loc.start,
                      locEnd: tokenAfterColon.loc.start,
                      missingLoc: tokenAfterColon.loc,
                  }
        const { loc, messageId } =
            diff > 0
                ? {
                      loc: { start: locStart, end: locEnd },
                      messageId: side === "key" ? "extraKey" : "extraValue",
                  }
                : {
                      loc: missingLoc,
                      messageId: side === "key" ? "missingKey" : "missingValue",
                  }

        context.report({
            node: property[side],
            loc,
            messageId,
            data: {
                key: getKey(property),
            },
            fix(fixer) {
                if (diff > 0) {
                    // Remove whitespace
                    if (side === "key") {
                        return fixer.removeRange([
                            tokenBeforeColon.range[1],
                            tokenBeforeColon.range[1] + diff,
                        ])
                    }
                    return fixer.removeRange([
                        tokenAfterColon.range[0] - diff,
                        tokenAfterColon.range[0],
                    ])
                }
                const spaces = " ".repeat(-diff)
                // Add whitespace
                if (side === "key") {
                    return fixer.insertTextAfter(tokenBeforeColon, spaces)
                }
                return fixer.insertTextBefore(tokenAfterColon, spaces)
            },
        })
    }

    /**
     * Gets the number of characters in a key, including quotes around string
     * keys and braces around computed property keys.
     * @param {ASTNode} property Property of on object literal.
     * @returns {int} Width of the key.
     */
    function getKeyWidth(pair: YAMLKeyValuePair) {
        const startToken = sourceCode.getFirstToken(pair)
        const endToken = getLastTokenBeforeColon(pair.key)

        return endToken.range[1] - startToken.range[0]
    }

    /**
     * Gets the whitespace around the colon in an object literal property.
     * @param {ASTNode} property Property node from an object literal.
     * @returns {Object} Whitespace before and after the property's colon.
     */
    function getPropertyWhitespace(pair: YAMLKeyValuePair) {
        const whitespace = /(\s*):(\s*)/u.exec(
            sourceCode.getText().slice(pair.key.range[1], pair.value.range[0]),
        )

        if (whitespace) {
            return {
                beforeColon: whitespace[1],
                afterColon: whitespace[2],
            }
        }
        return null
    }

    /**
     * Verifies spacing of property conforms to specified options.
     * @param  {ASTNode} node Property node being evaluated.
     * @param {Object} lineOptions Configured singleLine or multiLine options
     * @returns {void}
     */
    function verifySpacing(node: YAMLKeyValuePair, lineOptions: ParsedOption) {
        const actual = getPropertyWhitespace(node)

        if (actual) {
            // Object literal getters/setters lack colons
            report(
                node,
                "key",
                actual.beforeColon,
                lineOptions.beforeColon ? 1 : 0,
                lineOptions.mode,
            )
            report(
                node,
                "value",
                actual.afterColon,
                lineOptions.afterColon ? 1 : 0,
                lineOptions.mode,
            )
        }
    }

    /**
     * Verifies spacing of each property in a list.
     * @param {ASTNode[]} properties List of Property AST nodes.
     * @param {Object} lineOptions Configured singleLine or multiLine options
     * @returns {void}
     */
    function verifyListSpacing(
        properties: YAMLKeyValuePair[],
        lineOptions: ParsedOption,
    ) {
        const length = properties.length

        for (let i = 0; i < length; i++) {
            verifySpacing(properties[i], lineOptions)
        }
    }

    //--------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------

    if (alignmentOptions) {
        // Verify vertical alignment
        return defineAlignmentVisitor(alignmentOptions)
    }

    return defineSpacingVisitor()

    /**
     * Define alignment rule visitor
     */
    function defineAlignmentVisitor(alignmentOptions: AlignOption) {
        return {
            YAMLMapping(node: AST.YAMLMapping) {
                if (isSingleLine(node)) {
                    verifyListSpacing(
                        node.pairs.filter(isKeyValueProperty),
                        singleLineOptions,
                    )
                } else {
                    verifyAlignment(node)
                }
            },
        }

        /**
         * Verifies correct vertical alignment of a group of properties.
         * @param {ASTNode[]} properties List of Property AST nodes.
         * @returns {void}
         */
        function verifyGroupAlignment(properties: YAMLKeyValuePair[]) {
            const length = properties.length
            const widths = properties.map(getKeyWidth) // Width of keys, including quotes
            const align = alignmentOptions.on // "value" or "colon"
            let targetWidth = Math.max(...widths)
            let beforeColon: number,
                afterColon: number,
                mode: "strict" | "minimum"

            if (alignmentOptions && length > 1) {
                // When aligning values within a group, use the alignment configuration.
                beforeColon = alignmentOptions.beforeColon ? 1 : 0
                afterColon = alignmentOptions.afterColon ? 1 : 0
                mode = alignmentOptions.mode
            } else {
                beforeColon = multiLineOptions.beforeColon ? 1 : 0
                afterColon = multiLineOptions.afterColon ? 1 : 0
                mode = alignmentOptions.mode
            }

            // Conditionally include one space before or after colon
            targetWidth += align === "colon" ? beforeColon : afterColon

            for (let i = 0; i < length; i++) {
                const property = properties[i]
                const whitespace = getPropertyWhitespace(property)

                if (whitespace) {
                    // Object literal getters/setters lack a colon
                    const width = widths[i]

                    if (align === "value") {
                        report(
                            property,
                            "key",
                            whitespace.beforeColon,
                            beforeColon,
                            mode,
                        )
                        report(
                            property,
                            "value",
                            whitespace.afterColon,
                            targetWidth - width,
                            mode,
                        )
                    } else {
                        // align = "colon"
                        report(
                            property,
                            "key",
                            whitespace.beforeColon,
                            targetWidth - width,
                            mode,
                        )
                        report(
                            property,
                            "value",
                            whitespace.afterColon,
                            afterColon,
                            mode,
                        )
                    }
                }
            }
        }

        /**
         * Checks whether a property is a member of the property group it follows.
         * @param {ASTNode} lastMember The last Property known to be in the group.
         * @param {ASTNode} candidate The next Property that might be in the group.
         * @returns {boolean} True if the candidate property is part of the group.
         */
        function continuesPropertyGroup(
            lastMember: AST.YAMLPair,
            candidate: AST.YAMLPair,
        ) {
            const groupEndLine = lastMember.loc.start.line
            const candidateStartLine = candidate.loc.start.line

            if (candidateStartLine - groupEndLine <= 1) {
                return true
            }

            // Check that the first comment is adjacent to the end of the group, the
            // last comment is adjacent to the candidate property, and that successive
            // comments are adjacent to each other.
            const leadingComments = sourceCode.getCommentsBefore(candidate)

            if (
                leadingComments.length &&
                leadingComments[0].loc.start.line - groupEndLine <= 1 &&
                candidateStartLine - last(leadingComments).loc.end.line <= 1
            ) {
                for (let i = 1; i < leadingComments.length; i++) {
                    if (
                        leadingComments[i].loc.start.line -
                            leadingComments[i - 1].loc.end.line >
                        1
                    ) {
                        return false
                    }
                }
                return true
            }

            return false
        }

        /**
         * Creates groups of properties.
         * @param  {ASTNode} node ObjectExpression node being evaluated.
         * @returns {Array.<ASTNode[]>} Groups of property AST node lists.
         */
        function createGroups(node: AST.YAMLMapping) {
            if (node.pairs.length === 1) {
                return [node.pairs]
            }

            return node.pairs.reduce(
                (groups, property) => {
                    const currentGroup = last(groups)
                    const prev = last(currentGroup)

                    if (!prev || continuesPropertyGroup(prev, property)) {
                        currentGroup.push(property)
                    } else {
                        groups.push([property])
                    }

                    return groups
                },
                [[]] as AST.YAMLPair[][],
            )
        }

        /**
         * Verifies vertical alignment, taking into account groups of properties.
         * @param  {ASTNode} node ObjectExpression node being evaluated.
         * @returns {void}
         */
        function verifyAlignment(node: AST.YAMLMapping) {
            createGroups(node).forEach((group) => {
                const properties = group.filter(isKeyValueProperty)

                if (
                    properties.length > 0 &&
                    isSingleLineProperties(properties)
                ) {
                    verifyListSpacing(properties, multiLineOptions)
                } else {
                    verifyGroupAlignment(properties)
                }
            })
        }
    }

    /**
     * Define spacing rule visitor
     */
    function defineSpacingVisitor() {
        // Obey beforeColon and afterColon in each property as configured
        return {
            YAMLPair(node: AST.YAMLPair) {
                if (!isKeyValueProperty(node)) return
                verifySpacing(
                    node,
                    isSingleLine(node.parent)
                        ? singleLineOptions
                        : multiLineOptions,
                )
            },
        }
    }
}
