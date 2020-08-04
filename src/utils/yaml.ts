import type { AST } from "yaml-eslint-parser"
import type { RuleContext, YAMLNodeOrToken, Fix, RuleFixer } from "../types"

/**
 * Check if you are using tabs for indentation.
 * If you're using tabs, you're not sure if your YAML was parsed successfully, so almost all rules stop auto-fix.
 */
export function hasTabIndent(context: RuleContext) {
    for (const line of context.getSourceCode().getLines()) {
        if (/^\s*\t/u.test(line)) {
            return true
        }
        if (/^\s*-\s*\t/u.test(line)) {
            return true
        }
    }
    return false
}
/**
 * Calculate the required indentation for a given YAMLMapping pairs.
 * Before calling this function, make sure that no flow style exists above the given mapping.
 */
export function calcExpectIndentForPairs(
    mapping: AST.YAMLMapping,
    context: RuleContext,
): string | null {
    const sourceCode = context.getSourceCode()
    let parent = mapping.parent
    if (parent.type === "YAMLWithMeta") {
        const before = sourceCode.getTokenBefore(parent)
        if (before == null || before.loc.end.line < parent.loc.start.line) {
            // | &a {
            // |   foo: bar}
            // or
            // | &a
            // |   {
            // |     foo: bar}
            return calcExpectIndentFromBaseNode(
                parent,
                mapping.pairs[0],
                context,
            )
        }
        parent = parent.parent
    }
    if (parent.type === "YAMLDocument") {
        // document root
        // | foo: bar
        // or
        // | { foo: bar }
        const mappingIndent = getActualIndent(mapping, context)
        const firstPairIndent = getActualIndent(mapping.pairs[0], context)
        if (mappingIndent == null) {
            return firstPairIndent
        }
        if (
            firstPairIndent != null &&
            compareIndent(mappingIndent, firstPairIndent) < 0
        ) {
            return firstPairIndent
        }
        return mappingIndent
    }
    if (parent.type === "YAMLSequence") {
        const hyphen = sourceCode.getTokenBefore(mapping)
        if (hyphen?.value !== "-") {
            return null // unknown
        }
        if (hyphen.loc.start.line === mapping.loc.start.line) {
            // same line
            // | - foo: bar
            // |   x: y
            const hyphenIndent = getActualIndent(hyphen, context)
            if (hyphenIndent == null) {
                return null // unknown
            }
            const offsetIndent = sourceCode.text.slice(
                hyphen.range[1],
                mapping.range[0],
            )
            return `${hyphenIndent} ${offsetIndent}`
        }
        // not same line
        // | -
        // |   foo: bar
        // |   x: y
        return getActualIndent(mapping, context)
    }
    if (parent.type !== "YAMLPair") {
        return null
    }

    // YAMLPair
    // | key:
    // |   foo: bar
    return calcExpectIndentFromBaseNode(parent, mapping.pairs[0], context)
}
/**
 * Calculate the required indentation for a given YAMLSequence entries.
 */
export function calcExpectIndentForEntries(
    sequence: AST.YAMLSequence,
    context: RuleContext,
): string | null {
    const sourceCode = context.getSourceCode()
    let parent = sequence.parent
    if (parent.type === "YAMLWithMeta") {
        const before = sourceCode.getTokenBefore(parent)
        if (before == null || before.loc.end.line < parent.loc.start.line) {
            // | &a [
            // |   foo]
            // or
            // | &a
            // |   [
            // |     foo]
            return calcExpectIndentFromBaseNode(
                parent,
                sequence.entries[0],
                context,
            )
        }
        parent = parent.parent
    }
    if (parent.type === "YAMLDocument") {
        // document root
        // | [foo]
        const sequenceIndent = getActualIndent(sequence, context)
        const firstPairIndent = getActualIndent(sequence.entries[0], context)
        if (sequenceIndent == null) {
            return firstPairIndent
        }
        if (
            firstPairIndent != null &&
            compareIndent(sequenceIndent, firstPairIndent) < 0
        ) {
            return firstPairIndent
        }
        return sequenceIndent
    }
    if (parent.type === "YAMLSequence") {
        const hyphen = sourceCode.getTokenBefore(sequence)
        if (hyphen?.value !== "-") {
            return null // unknown
        }
        if (hyphen.loc.start.line === sequence.loc.start.line) {
            // same line
            // | - [foo,
            // |    bar]
            // or
            // | - - foo
            // |   - bar
            const hyphenIndent = getActualIndent(hyphen, context)
            if (hyphenIndent == null) {
                return null // unknown
            }
            const offsetIndent = sourceCode.text.slice(
                hyphen.range[1],
                sequence.range[0],
            )
            return `${hyphenIndent} ${offsetIndent}`
        }
        // not same line
        // | -
        // |   foo
        return getActualIndent(sequence, context)
    }
    if (parent.type !== "YAMLPair") {
        return null
    }

    // YAMLPair
    // | key:
    // |   foo: bar
    return calcExpectIndentFromBaseNode(parent, sequence.entries[0], context)
}

/**
 * Calculate the required indentation from a given base node.
 */
function calcExpectIndentFromBaseNode(
    baseNode: AST.YAMLNode,
    node: AST.YAMLNode,
    context: RuleContext,
) {
    const baseIndent = getActualIndent(baseNode, context)
    if (baseIndent == null) {
        return null // unknown
    }
    const indent = getActualIndent(node, context)
    if (indent != null && compareIndent(baseIndent, indent) < 0) {
        // Already a valid indent.
        return indent
    }
    return incIndent(baseIndent, context)
}

/**
 * Get the actual indentation for a given node.
 */
export function getActualIndent(
    node: YAMLNodeOrToken,
    context: RuleContext,
): string | null {
    const sourceCode = context.getSourceCode()
    const before = sourceCode.getTokenBefore(node, { includeComments: true })
    if (!before || before.loc.end.line < node.loc.start.line) {
        return getActualIndentFromLine(node.loc.start.line, context)
    }
    return null // none
}

/**
 * Get the actual indentation for a given line.
 */
export function getActualIndentFromLine(
    line: number,
    context: RuleContext,
): string {
    const sourceCode = context.getSourceCode()
    const lineText = sourceCode.getLines()[line - 1]
    return /^[^\S\r\n\u2028\u2029]*/u.exec(lineText)![0]
}

/**
 * Returns the indent that is incremented.
 */
export function incIndent(indent: string, context: RuleContext) {
    const numOfIndent = getNumOfIndent(context)
    const add =
        numOfIndent === 2
            ? "  "
            : numOfIndent === 4
            ? "    "
            : " ".repeat(numOfIndent)
    return `${indent}${add}`
}

/**
 * Returns the indent that is incremented.
 */
export function decIndent(indent: string, context: RuleContext) {
    const numOfIndent = getNumOfIndent(context)
    return " ".repeat(indent.length - numOfIndent)
}

/**
 * Get the number of indentation offset
 */
export function getNumOfIndent(
    context: RuleContext,
    optionValue?: number | null,
): number {
    const num = optionValue ?? context.settings?.yml?.indent
    return num == null || num < 2 ? 2 : num
}

/**
 * Check if the indent is increasing.
 */
export function compareIndent(a: string, b: string) {
    const minLen = Math.min(a.length, b.length)
    for (let index = 0; index < minLen; index++) {
        if (a[index] !== b[index]) {
            return NaN // unknown
        }
    }
    return a.length > b.length ? 1 : a.length < b.length ? -1 : 0
}

/**
 * Check if the given node is key node.
 */
export function isKeyNode(node: AST.YAMLContent | AST.YAMLWithMeta): boolean {
    if (node.parent.type === "YAMLWithMeta") {
        return isKeyNode(node.parent)
    }
    return node.parent.type === "YAMLPair" && node.parent.key === node
}

/**
 * Unwrap meta
 */
export function unwrapMeta(node: AST.YAMLContent | AST.YAMLWithMeta | null) {
    if (node?.type === "YAMLWithMeta") {
        return node.value
    }
    return node
}

/**
 * Adjust indent
 */
export function* processIndentFix(
    fixer: RuleFixer,
    baseIndent: string,
    targetNode: AST.YAMLContent | AST.YAMLWithMeta | AST.YAMLPair,
    context: RuleContext,
): IterableIterator<Fix> {
    const sourceCode = context.getSourceCode()
    if (targetNode.type === "YAMLWithMeta") {
        yield* metaIndent(targetNode)
        return
    }
    if (targetNode.type === "YAMLPair") {
        yield* pairIndent(targetNode)
        return
    }

    // YAMLContent
    yield* contentIndent(targetNode)

    /**
     * for YAMLContent
     */
    function* contentIndent(contentNode: AST.YAMLContent) {
        const actualIndent = getActualIndent(contentNode, context)
        if (
            actualIndent != null &&
            compareIndent(baseIndent, actualIndent) < 0
        ) {
            return
        }
        let nextBaseIndent = baseIndent
        const expectValueIndent = incIndent(baseIndent, context)
        if (actualIndent != null) {
            yield* fixIndent(expectValueIndent, contentNode)
            nextBaseIndent = expectValueIndent
        }

        if (contentNode.type === "YAMLMapping") {
            for (const p of contentNode.pairs) {
                yield* processIndentFix(fixer, nextBaseIndent, p, context)
            }
        } else if (contentNode.type === "YAMLSequence") {
            for (const e of contentNode.entries) {
                yield* processIndentFix(fixer, nextBaseIndent, e, context)
            }
        }
    }

    /**
     * for YAMLWithMeta
     */
    function* metaIndent(metaNode: AST.YAMLWithMeta) {
        let nextBaseIndent = baseIndent
        const actualIndent = getActualIndent(metaNode, context)
        if (actualIndent != null) {
            if (compareIndent(baseIndent, actualIndent) < 0) {
                nextBaseIndent = actualIndent
            } else {
                const expectMetaIndent = incIndent(baseIndent, context)
                yield* fixIndent(expectMetaIndent, metaNode)
                nextBaseIndent = expectMetaIndent
            }
        }
        if (metaNode.value) {
            yield* processIndentFix(
                fixer,
                nextBaseIndent,
                metaNode.value,
                context,
            )
        }
    }

    /**
     * for YAMLPair
     */
    function* pairIndent(pairNode: AST.YAMLPair) {
        let nextBaseIndent = baseIndent
        // key indent
        const actualIndent = getActualIndent(pairNode, context)
        if (actualIndent != null) {
            if (compareIndent(baseIndent, actualIndent) < 0) {
                nextBaseIndent = actualIndent
            } else {
                const expectKeyIndent = incIndent(baseIndent, context)
                yield* fixIndent(expectKeyIndent, pairNode)
                nextBaseIndent = expectKeyIndent
            }
        }
        if (pairNode.value) {
            yield* processIndentFix(
                fixer,
                nextBaseIndent,
                pairNode.value,
                context,
            )
        }
    }

    /**
     * Fix indent
     */
    function* fixIndent(indent: string, n: AST.YAMLNode) {
        const prevToken = sourceCode.getTokenBefore(n, {
            includeComments: true,
        })
        yield fixer.replaceTextRange(
            [prevToken!.range[1], n.range[0]],
            `\n${indent}`,
        )
    }
}
