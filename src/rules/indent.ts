import type { AST } from "yaml-eslint-parser"
import { createRule } from "../utils"
import { hasTabIndent, getNumOfIndent } from "../utils/yaml"
import type { YAMLToken, Fix, RuleFixer } from "../types"
import { isHyphen, isQuestion, isColon } from "../utils/ast-utils"

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
const ITERATION_OPTS = Object.freeze({
    includeComments: true,
} as const)
type Offset = -1 | 0 | 1
type OffsetInfo = {
    baseToken: YAMLToken | null
    offset: Offset
    offsetWhenBaseIsNotFirst: Offset | null
    expectedIndent?: number
}
type LineIndentStep1 = {
    line: number
    firstToken: YAMLToken
    expectedIndent: number | null
    actualIndent: number
    markData: LineIndentMarkData[]
    lastScalar: null | LineIndentLastScalarData
}

type LineIndentStep2 = {
    line: number
    expectedIndent: number
    actualIndent: number
    markData: LineIndentMarkData[]
    indentBlockScalar?: {
        node: AST.YAMLBlockLiteralScalar | AST.YAMLBlockFoldedScalar
    }
}

type LineIndentMarkData = {
    mark: YAMLToken
    next: YAMLToken
    expectedOffset: number
    actualOffset: number
}

type LineIndentLastScalarData = {
    token: YAMLToken
    node: AST.YAMLScalar
    expectedIndent: number
}

export default createRule("indent", {
    meta: {
        docs: {
            description: "enforce consistent indentation",
            categories: ["standard"],
            extensionRule: false,
            layout: true,
        },
        fixable: "whitespace",
        schema: [
            {
                type: "integer",
                minimum: 2,
            },
        ],
        messages: {
            wrongIndentation:
                "Expected indentation of {{expected}} spaces but found {{actual}} spaces.",
        },
        type: "layout",
    },
    create(context) {
        if (!context.parserServices.isYAML) {
            return {}
        }

        if (hasTabIndent(context)) {
            // cannot check
            return {}
        }

        const numOfIndent = getNumOfIndent(context, context.options[0])

        const sourceCode = context.getSourceCode()

        const offsets = new Map<YAMLToken, OffsetInfo>()
        const marks = new Set<YAMLToken>()
        const blockLiteralMarks = new Set<YAMLToken>()
        const scalars = new Map<YAMLToken, AST.YAMLScalar>()

        /**
         * Set offset to the given tokens.
         * @param token The token to set.
         * @param offset The offset of the tokens.
         * @param baseToken The token of the base offset.
         */
        function setOffset(
            token: YAMLToken | (YAMLToken | null)[] | null,
            offset: Offset,
            baseToken: YAMLToken,
            options?: { offsetWhenBaseIsNotFirst?: Offset },
        ) {
            if (token == null) {
                return
            }
            if (Array.isArray(token)) {
                for (const t of token) {
                    setOffset(t, offset, baseToken, options)
                }
            } else {
                offsets.set(token, {
                    baseToken,
                    offset,
                    offsetWhenBaseIsNotFirst:
                        options?.offsetWhenBaseIsNotFirst ?? null,
                })
            }
        }

        /**
         * Process the given node list.
         * @param {(AST.YAMLNode|null)[]} nodeList The node to process.
         * @param {number} offset The offset to set.
         * @returns {void}
         */
        function processNodeList(
            nodeList: (AST.YAMLNode | null)[],
            left: YAMLToken,
            right: YAMLToken | null,
            offset: Offset,
        ) {
            let lastToken = left

            const alignTokens = new Set<YAMLToken>()
            for (const node of nodeList) {
                if (node == null) {
                    // Holes of an array.
                    continue
                }
                const elementTokens = {
                    firstToken: sourceCode.getFirstToken(node)!,
                    lastToken: sourceCode.getLastToken(node)!,
                }

                // Collect comma/comment tokens between the last token of the previous node and the first token of this node.
                let t: YAMLToken | null = lastToken
                while (
                    (t = sourceCode.getTokenAfter(t, ITERATION_OPTS)) != null &&
                    t.range[1] <= elementTokens.firstToken.range[0]
                ) {
                    alignTokens.add(t)
                }

                alignTokens.add(elementTokens.firstToken)

                // Save the last token to find tokens between this node and the next node.
                lastToken = elementTokens.lastToken
            }

            // Check trailing commas and comments.
            if (right != null) {
                let t: YAMLToken | null = lastToken
                while (
                    (t = sourceCode.getTokenAfter(t, ITERATION_OPTS)) != null &&
                    t.range[1] <= right.range[0]
                ) {
                    alignTokens.add(t)
                }
            }

            alignTokens.delete(left)

            // Set offsets.
            setOffset([...alignTokens], offset, left)

            if (right != null) {
                setOffset(right, 0, left)
            }
        }

        const documents: AST.YAMLDocument[] = []
        return {
            YAMLDocument(node) {
                documents.push(node)
                const first = sourceCode.getFirstToken(node, ITERATION_OPTS)
                if (!first) {
                    return
                }

                offsets.set(first, {
                    baseToken: null,
                    offsetWhenBaseIsNotFirst: null,
                    offset: 0,
                    expectedIndent: 0,
                })
                processNodeList(
                    [...node.directives, node.content],
                    first,
                    null,
                    0,
                )
            },
            YAMLMapping(node) {
                if (node.style === "flow") {
                    // | {
                    // |   a: b,
                    // |   c: d
                    // | }
                    const open = sourceCode.getFirstToken(node)
                    const close = sourceCode.getLastToken(node)
                    processNodeList(node.pairs, open, close, 1)
                } else if (node.style === "block") {
                    // | a: b
                    // | c: d
                    const first = sourceCode.getFirstToken(node)
                    processNodeList(node.pairs, first, null, 0)
                }
            },
            YAMLSequence(node) {
                if (node.style === "flow") {
                    // | [
                    // |   a,
                    // |   b
                    // | ]
                    const open = sourceCode.getFirstToken(node)!
                    const close = sourceCode.getLastToken(node)
                    processNodeList(node.entries, open, close, 1)
                } else if (node.style === "block") {
                    // | - a
                    // | - b
                    const first = sourceCode.getFirstToken(node)
                    processNodeList(node.entries, first, null, 0)
                    for (const entry of node.entries) {
                        if (!entry) {
                            continue
                        }
                        const hyphen = sourceCode.getTokenBefore(
                            entry,
                            isHyphen,
                        )!
                        marks.add(hyphen)
                        // | -
                        // |   a
                        const entryToken = sourceCode.getFirstToken(entry)
                        setOffset(entryToken, 1, hyphen)
                    }
                }
            },
            // eslint-disable-next-line complexity -- X(
            YAMLPair(node) {
                const pairFirst = sourceCode.getFirstToken(node)
                let questionToken: YAMLToken | null = null
                let keyToken: YAMLToken | null = null
                let colonToken: YAMLToken | null = null
                let valueToken: YAMLToken | null = null
                if (isQuestion(pairFirst)) {
                    // ? a: b
                    questionToken = pairFirst
                    marks.add(questionToken)
                }

                if (node.value) {
                    valueToken = sourceCode.getFirstToken(node.value)
                    colonToken = sourceCode.getTokenBefore(node.value, isColon)
                }
                if (node.key) {
                    keyToken = sourceCode.getFirstToken(node.key)
                    if (!colonToken) {
                        const token = sourceCode.getTokenAfter(
                            node.key,
                            isColon,
                        )
                        if (token && token.range[0] < node.range[1]) {
                            colonToken = token
                        }
                    }
                }
                if (!colonToken) {
                    const tokens = sourceCode.getTokens(node, isColon)
                    if (tokens.length) {
                        colonToken = tokens[0]
                    }
                }

                if (keyToken) {
                    if (questionToken) {
                        setOffset(keyToken, 1, questionToken)
                    }
                }
                if (colonToken) {
                    marks.add(colonToken)
                    if (questionToken) {
                        setOffset(colonToken, 0, questionToken, {
                            offsetWhenBaseIsNotFirst: 1,
                        })
                    } else if (keyToken) {
                        setOffset(colonToken, 1, keyToken)
                    }
                }
                if (valueToken) {
                    if (colonToken) {
                        setOffset(valueToken, 1, colonToken)
                    } else if (keyToken) {
                        setOffset(valueToken, 1, keyToken)
                    }
                }
            },
            YAMLWithMeta(node) {
                const anchorToken =
                    node.anchor && sourceCode.getFirstToken(node.anchor)
                const tagToken = node.tag && sourceCode.getFirstToken(node.tag)

                let baseToken: YAMLToken
                if (anchorToken && tagToken) {
                    if (anchorToken.range[0] < tagToken.range[0]) {
                        setOffset(tagToken, 0, anchorToken, {
                            offsetWhenBaseIsNotFirst: 1,
                        })
                        baseToken = anchorToken
                    } else {
                        setOffset(anchorToken, 0, tagToken, {
                            offsetWhenBaseIsNotFirst: 1,
                        })
                        baseToken = tagToken
                    }
                } else {
                    baseToken = (anchorToken || tagToken)!
                }
                if (node.value) {
                    const valueToken = sourceCode.getFirstToken(node.value)
                    setOffset(valueToken, 1, baseToken)
                }
            },
            YAMLScalar(node) {
                if (node.style === "folded" || node.style === "literal") {
                    if (!node.value.trim()) {
                        // ignore blank
                        return
                    }
                    const mark = sourceCode.getFirstToken(node)
                    const literal = sourceCode.getLastToken(node)
                    setOffset(literal, 1, mark)
                    scalars.set(literal, node)
                    blockLiteralMarks.add(mark)
                } else {
                    scalars.set(sourceCode.getFirstToken(node), node)
                }
            },
            "Program:exit"(node) {
                const lineIndentsWk: (LineIndentStep1 | undefined)[] = []
                let tokensOnSameLine: YAMLToken[] = []
                // Validate indentation of tokens.
                for (const token of sourceCode.getTokens(
                    node,
                    ITERATION_OPTS,
                )) {
                    if (
                        tokensOnSameLine.length === 0 ||
                        tokensOnSameLine[0].loc.start.line ===
                            token.loc.start.line
                    ) {
                        // This is on the same line (or the first token).
                        tokensOnSameLine.push(token)
                    } else {
                        // New line is detected, so validate the tokens.
                        const lineIndent =
                            processExpectedIndent(tokensOnSameLine)
                        lineIndentsWk[lineIndent.line] = lineIndent
                        tokensOnSameLine = [token]
                    }
                }
                if (tokensOnSameLine.length >= 1) {
                    const lineIndent = processExpectedIndent(tokensOnSameLine)
                    lineIndentsWk[lineIndent.line] = lineIndent
                }
                const lineIndents = processMissingLines(lineIndentsWk)

                validateLines(lineIndents)
            },
        }

        /* eslint-disable complexity -- X( */
        /**
         * Process the expected indent for given line tokens
         */
        function processExpectedIndent(
            /* eslint-enable complexity -- X( */
            lineTokens: YAMLToken[],
        ): LineIndentStep1 {
            const lastToken = lineTokens[lineTokens.length - 1]
            let lineExpectedIndent: number | null = null
            let cacheExpectedIndent: number | null = null
            const markData: LineIndentMarkData[] = []
            const firstToken = lineTokens.shift()!
            let token: YAMLToken | undefined = firstToken
            let expectedIndent = getExpectedIndent(token)
            if (expectedIndent != null) {
                lineExpectedIndent = expectedIndent
                cacheExpectedIndent = expectedIndent
            }
            while (token && marks.has(token) && expectedIndent != null) {
                const nextToken = lineTokens.shift()
                if (!nextToken) {
                    break
                }
                const nextExpectedIndent = getExpectedIndent(nextToken)
                if (
                    nextExpectedIndent == null ||
                    expectedIndent >= nextExpectedIndent
                ) {
                    lineTokens.unshift(nextToken)
                    break
                }
                markData.push({
                    mark: token,
                    next: nextToken,
                    expectedOffset:
                        nextExpectedIndent -
                        expectedIndent -
                        1 /* "-" or "?" or ":" */,
                    actualOffset: nextToken.range[0] - token.range[1],
                })
                if (blockLiteralMarks.has(nextToken)) {
                    // For block literal mark token.
                    // e.g.
                    //
                    // - |
                    //   text
                    //   text
                    lineTokens.unshift(nextToken)
                    break
                }
                // For other tokens.
                // e.g.
                //
                // - [
                //     text
                //     text
                //   ]
                token = nextToken
                expectedIndent = nextExpectedIndent
                cacheExpectedIndent = expectedIndent
            }

            if (lineExpectedIndent == null) {
                while ((token = lineTokens.shift()) != null) {
                    lineExpectedIndent = getExpectedIndent(token)
                    if (lineExpectedIndent != null) {
                        break
                    }
                }
            }

            const scalarNode = scalars.get(lastToken)
            if (scalarNode) {
                lineTokens.pop()
            }

            if (cacheExpectedIndent != null) {
                // Sets the indent cache for the tokens behind this line.
                while ((token = lineTokens.shift()) != null) {
                    const offset = offsets.get(token)
                    if (offset) {
                        offset.expectedIndent = cacheExpectedIndent
                    }
                }
            }

            let lastScalar: LineIndentLastScalarData | null = null

            if (scalarNode) {
                const expectedScalarIndent = getExpectedIndent(lastToken)
                if (expectedScalarIndent != null) {
                    lastScalar = {
                        expectedIndent: expectedScalarIndent,
                        token: lastToken,
                        node: scalarNode,
                    }
                }
            }
            const { line, column } = firstToken.loc.start

            return {
                expectedIndent: lineExpectedIndent,
                actualIndent: column,
                firstToken,
                line,
                markData,
                lastScalar,
            }
        }

        /**
         * Get the expected indent from given token
         */
        function getExpectedIndent(token: YAMLToken): number | null {
            if (token.type === "Marker") {
                return 0
            }
            const offset = offsets.get(token)
            if (!offset) {
                return null
            }
            if (offset.expectedIndent != null) {
                return offset.expectedIndent
            }
            if (offset.baseToken == null) {
                return null
            }
            const baseIndent = getExpectedIndent(offset.baseToken)
            if (baseIndent == null) {
                return null
            }
            let offsetIndent = offset.offset
            if (offsetIndent === 0 && offset.offsetWhenBaseIsNotFirst != null) {
                let before: YAMLToken | null = offset.baseToken
                while (
                    (before = sourceCode.getTokenBefore(
                        before,
                        ITERATION_OPTS,
                    )) != null
                ) {
                    if (!marks.has(before)) {
                        break
                    }
                }
                if (before?.loc.end.line === offset.baseToken.loc.start.line) {
                    // base token is not first
                    offsetIndent = offset.offsetWhenBaseIsNotFirst
                }
            }
            return (offset.expectedIndent =
                baseIndent + numOfIndent * offsetIndent)
        }

        /**
         * Calculates the indent for lines with missing indent information.
         */
        function processMissingLines(
            lineIndents: (LineIndentStep1 | undefined)[],
        ) {
            const results: (LineIndentStep2 | undefined)[] = []
            const commentLines: {
                range: [number, number]
                commentLineIndents: LineIndentStep1[]
            }[] = []
            for (const lineIndent of lineIndents) {
                if (!lineIndent) {
                    continue
                }
                const line = lineIndent.line
                if (lineIndent.firstToken.type === "Block") {
                    const last = commentLines[commentLines.length - 1]
                    if (last && last.range[1] === line - 1) {
                        last.range[1] = line
                        last.commentLineIndents.push(lineIndent)
                    } else {
                        commentLines.push({
                            range: [line, line],
                            commentLineIndents: [lineIndent],
                        })
                    }
                } else if (lineIndent.expectedIndent != null) {
                    const indent = {
                        line,
                        expectedIndent: lineIndent.expectedIndent,
                        actualIndent: lineIndent.actualIndent,
                        markData: lineIndent.markData,
                    }
                    if (!results[line]) {
                        results[line] = indent
                    }
                    if (lineIndent.lastScalar) {
                        const scalarNode = lineIndent.lastScalar.node
                        if (
                            scalarNode.style === "literal" ||
                            scalarNode.style === "folded"
                        ) {
                            // | >
                            // |   foo
                            // or
                            // | |
                            // |   foo
                            processBlockLiteral(
                                indent,
                                scalarNode,
                                lineIndent.lastScalar.expectedIndent,
                            )
                        } else {
                            processScalar(
                                indent,
                                scalarNode,
                                lineIndent.lastScalar.expectedIndent,
                            )
                        }
                    }
                }
            }

            processComments(commentLines, lineIndents)

            return results

            /**
             * Process comments.
             */
            function processComments(
                commentLines: {
                    range: [number, number]
                    commentLineIndents: LineIndentStep1[]
                }[],
                lineIndents: (LineIndentStep1 | undefined)[],
            ) {
                for (const { range, commentLineIndents } of commentLines) {
                    let prev: LineIndentStep2 | undefined = results
                        .slice(0, range[0])
                        .filter((data) => data)
                        .pop()
                    const next: LineIndentStep2 | undefined = results
                        .slice(range[1] + 1)
                        .filter((data) => data)
                        .shift()

                    if (isBlockLiteral(prev)) {
                        prev = undefined
                    }

                    const expectedIndents: number[] = []
                    let either: LineIndentStep2 | undefined
                    if (prev && next) {
                        expectedIndents.unshift(next.expectedIndent)
                        if (next.expectedIndent < prev.expectedIndent) {
                            let indent = next.expectedIndent + numOfIndent
                            while (indent <= prev.expectedIndent) {
                                expectedIndents.unshift(indent)
                                indent += numOfIndent
                            }
                        }
                    } else if ((either = prev || next)) {
                        expectedIndents.unshift(either.expectedIndent)
                        if (!next) {
                            let indent = either.expectedIndent - numOfIndent
                            while (indent >= 0) {
                                expectedIndents.push(indent)
                                indent -= numOfIndent
                            }
                        }
                    }
                    if (!expectedIndents.length) {
                        continue
                    }

                    let expectedIndent = expectedIndents[0]
                    for (const commentLineIndent of commentLineIndents) {
                        if (results[commentLineIndent.line]) {
                            continue
                        }
                        expectedIndent = Math.min(
                            expectedIndents.find((indent, index) => {
                                if (indent <= commentLineIndent.actualIndent) {
                                    return true
                                }
                                const prev = expectedIndents[index + 1] ?? -1
                                return (
                                    prev < commentLineIndent.actualIndent &&
                                    commentLineIndent.actualIndent < indent
                                )
                            }) ?? expectedIndent,
                            expectedIndent,
                        )
                        results[commentLineIndent.line] = {
                            line: commentLineIndent.line,
                            expectedIndent,
                            actualIndent: commentLineIndent.actualIndent,
                            markData: commentLineIndent.markData,
                        }
                    }
                }

                /**
                 * Checks whether given prev data is block literal
                 */
                function isBlockLiteral(
                    prev: LineIndentStep2 | undefined,
                ): boolean {
                    if (!prev) {
                        return false
                    }
                    for (let prevLine = prev.line; prevLine >= 0; prevLine--) {
                        const prevLineIndent = lineIndents[prev.line]
                        if (!prevLineIndent) {
                            continue
                        }
                        if (prevLineIndent.lastScalar) {
                            const scalarNode = prevLineIndent.lastScalar.node
                            if (
                                scalarNode.style === "literal" ||
                                scalarNode.style === "folded"
                            ) {
                                if (
                                    scalarNode.loc.start.line <= prev.line &&
                                    prev.line <= scalarNode.loc.end.line
                                ) {
                                    return true
                                }
                            }
                        }
                        return false
                    }
                    return false
                }
            }

            /**
             * Process block literal
             */
            function processBlockLiteral(
                lineIndent: LineIndentStep2,
                scalarNode:
                    | AST.YAMLBlockLiteralScalar
                    | AST.YAMLBlockFoldedScalar,
                expectedIndent: number,
            ) {
                if (scalarNode.indent != null) {
                    if (lineIndent.expectedIndent < lineIndent.actualIndent) {
                        // no check
                        lineIndent.expectedIndent = lineIndent.actualIndent
                        return
                    }

                    lineIndent.indentBlockScalar = {
                        node: scalarNode,
                    }
                }
                const firstLineActualIndent = lineIndent.actualIndent

                for (
                    let scalarLine = lineIndent.line + 1;
                    scalarLine <= scalarNode.loc.end.line;
                    scalarLine++
                ) {
                    const actualLineIndent = getActualLineIndent(scalarLine)
                    if (actualLineIndent == null) {
                        continue
                    }
                    const scalarActualIndent = Math.min(
                        firstLineActualIndent,
                        actualLineIndent,
                    )
                    results[scalarLine] = {
                        line: scalarLine,
                        expectedIndent,
                        actualIndent: scalarActualIndent,
                        markData: [],
                    }
                }
            }

            /**
             * Process block literal
             */
            function processScalar(
                lineIndent: LineIndentStep2,
                scalarNode: AST.YAMLScalar,
                expectedIndent: number,
            ) {
                for (
                    let scalarLine = lineIndent.line + 1;
                    scalarLine <= scalarNode.loc.end.line;
                    scalarLine++
                ) {
                    const scalarActualIndent = getActualLineIndent(scalarLine)
                    if (scalarActualIndent == null) {
                        continue
                    }
                    results[scalarLine] = {
                        line: scalarLine,
                        expectedIndent,
                        actualIndent: scalarActualIndent,
                        markData: [],
                    }
                }
            }
        }

        /**
         * Validate lines
         */
        function validateLines(lineIndents: (LineIndentStep2 | undefined)[]) {
            for (const lineIndent of lineIndents) {
                if (!lineIndent) {
                    continue
                }
                if (lineIndent.actualIndent !== lineIndent.expectedIndent) {
                    context.report({
                        loc: {
                            start: {
                                line: lineIndent.line,
                                column: 0,
                            },
                            end: {
                                line: lineIndent.line,
                                column: lineIndent.actualIndent,
                            },
                        },
                        messageId: "wrongIndentation",
                        data: {
                            expected: String(lineIndent.expectedIndent),
                            actual: String(lineIndent.actualIndent),
                        },
                        fix: buildFix(lineIndent, lineIndents),
                    })
                } else if (lineIndent.markData.length) {
                    for (const markData of lineIndent.markData) {
                        if (markData.actualOffset !== markData.expectedOffset) {
                            const markLoc = markData.mark.loc.end
                            const loc = markData.next.loc.start

                            context.report({
                                loc: {
                                    start: markLoc,
                                    end: loc,
                                },
                                messageId: "wrongIndentation",
                                data: {
                                    expected: String(markData.expectedOffset),
                                    actual: String(markData.actualOffset),
                                },
                                fix: buildFix(lineIndent, lineIndents),
                            })
                        }
                    }
                }
            }
        }

        /* eslint-disable complexity -- X */
        /**
         * Build the fixer function that makes collect indentation.
         */
        function buildFix(
            /* eslint-enable complexity -- X */
            lineIndent: LineIndentStep2,
            lineIndents: (LineIndentStep2 | undefined)[],
        ) {
            const { line, expectedIndent } = lineIndent
            const document =
                documents.find(
                    (doc) =>
                        doc.loc.start.line <= line && line <= doc.loc.end.line,
                ) || sourceCode.ast

            let startLine = document.loc.start.line
            let endLine = document.loc.end.line
            // find fixing start line
            for (
                let lineIndex = line - 1;
                lineIndex >= document.loc.start.line;
                lineIndex--
            ) {
                const li = lineIndents[lineIndex]
                if (!li) {
                    continue
                }
                if (li.expectedIndent < expectedIndent) {
                    // outdent

                    // If the fixed indent becomes incorrect compared to the actual indent of the previous line, the process is stopped.
                    if (expectedIndent <= li.actualIndent) {
                        return null
                    }
                    for (const mark of li.markData) {
                        if (mark.actualOffset !== mark.expectedOffset) {
                            // If the mark indentation on the previous line needs to be fixed, the process will stop.
                            return null
                        }
                    }
                    startLine = lineIndex + 1
                    break
                }
            }
            // find fixing end line
            for (
                let lineIndex = line + 1;
                lineIndex <= document.loc.end.line;
                lineIndex++
            ) {
                const li = lineIndents[lineIndex]
                if (!li) {
                    continue
                }
                if (li && li.expectedIndent < expectedIndent) {
                    // outdent

                    // If the fixed indent becomes incorrect compared to the actual indent of the next line, the process is stopped.
                    if (expectedIndent <= li.actualIndent) {
                        return null
                    }
                    endLine = lineIndex - 1
                    break
                }
            }
            for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
                const li = lineIndents[lineIndex]
                if (li?.indentBlockScalar) {
                    const blockLiteral = li.indentBlockScalar.node
                    const diff = li.expectedIndent - li.actualIndent
                    const mark = sourceCode.getFirstToken(blockLiteral)!
                    const num = /\d+/u.exec(mark.value)?.[0]
                    if (num != null) {
                        const newIndent = Number(num) + diff
                        if (newIndent >= 10) {
                            // The new indentation indicator is too big
                            return null
                        }
                    }
                }
            }
            return function* (fixer: RuleFixer): IterableIterator<Fix> {
                type Stack = {
                    indent: number
                    parentIndent: number
                    upper: Stack
                }
                let stacks: Stack | null = null
                for (
                    let lineIndex = startLine;
                    lineIndex <= endLine;
                    lineIndex++
                ) {
                    const li = lineIndents[lineIndex]
                    if (!li) {
                        continue
                    }
                    const lineExpectedIndent = li.expectedIndent

                    if (stacks == null) {
                        if (li.expectedIndent !== li.actualIndent) {
                            yield* fixLine(fixer, li)
                        }
                    } else {
                        if (stacks.indent < lineExpectedIndent) {
                            stacks = {
                                indent: lineExpectedIndent,
                                parentIndent: stacks.indent,
                                upper: stacks,
                            }
                        } else if (lineExpectedIndent < stacks.indent) {
                            stacks = stacks.upper
                        }

                        // Check if indentation is needed.
                        // |  a: # stacks.parentIndent
                        // | b # li.actualIndent
                        if (li.actualIndent <= stacks.parentIndent) {
                            yield* fixLine(fixer, li)
                        }
                    }

                    // hyphen
                    if (li.markData) {
                        for (const markData of li.markData) {
                            yield fixer.replaceTextRange(
                                [
                                    markData.mark.range[1],
                                    markData.next.range[0],
                                ],
                                " ".repeat(markData.expectedOffset),
                            )
                        }
                    }
                }
            }
        }

        /**
         * Fix a line
         */
        function* fixLine(fixer: RuleFixer, li: LineIndentStep2) {
            if (li.indentBlockScalar) {
                const blockLiteral = li.indentBlockScalar.node
                const diff = li.expectedIndent - li.actualIndent
                const mark = sourceCode.getFirstToken(blockLiteral)!
                yield fixer.replaceText(
                    mark,
                    mark.value.replace(
                        /\d+/u,
                        (num: string) => `${Number(num) + diff}`,
                    ),
                )
            }
            const expectedIndent = li.expectedIndent
            yield fixer.replaceTextRange(
                [
                    sourceCode.getIndexFromLoc({
                        line: li.line,
                        column: 0,
                    }),
                    sourceCode.getIndexFromLoc({
                        line: li.line,
                        column: li.actualIndent,
                    }),
                ],
                " ".repeat(expectedIndent),
            )
        }

        /**
         * Get actual indent from given line
         */
        function getActualLineIndent(line: number) {
            const lineText = sourceCode.lines[line - 1]
            if (!lineText.length) {
                return null
            }
            return /^\s*/u.exec(lineText)![0].length
        }
    },
})
