import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index.js";
import { hasTabIndent, getNumOfIndent } from "../utils/yaml.js";
import type { YAMLToken, Fix, RuleFixer, RuleContext } from "../types.js";
import { isHyphen, isQuestion, isColon } from "../utils/ast-utils.js";
import { getSourceCode } from "../utils/compat.js";

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
const ITERATION_OPTS = Object.freeze({
  includeComments: true,
} as const);
type Offset = -1 | 0 | 1;
type IndentInfo = {
  baseToken: YAMLToken | null;
  indent: number;
  indentWhenBaseIsNotFirst: number | null;
  expectedIndent?: number;
};
type LineIndentStep1 = {
  line: number;
  firstToken: YAMLToken;
  expectedIndent: number | null;
  actualIndent: number;
  indicatorData: LineIndentIndicatorData[];
  lastScalar: null | LineIndentLastScalarData;
};

type LineIndentStep2 = {
  line: number;
  expectedIndent: number;
  actualIndent: number;
  indicatorData: LineIndentIndicatorData[];
  indentBlockScalar?: {
    node: AST.YAMLBlockLiteralScalar | AST.YAMLBlockFoldedScalar;
  };
};

type LineIndentIndicatorData = {
  indicator: YAMLToken;
  next: YAMLToken;
  expectedOffset: number;
  actualOffset: number;
};

type LineIndentLastScalarData = {
  token: YAMLToken;
  node: AST.YAMLScalar;
  expectedIndent: number;
};

/**
 * Parse options
 */
function parseOptions(context: RuleContext) {
  const [indentOption, objectOptions] = context.options as [
    number | undefined,
    (
      | {
          indentBlockSequences?: boolean;
          indicatorValueIndent?: number;
          alignMultilineFlowScalars?: boolean;
        }
      | undefined
    ),
  ];
  const numOfIndent = getNumOfIndent(context, indentOption);
  let indentBlockSequences = true;
  let indicatorValueIndent = numOfIndent;
  let alignMultilineFlowScalars = false;
  if (objectOptions) {
    if (objectOptions.indentBlockSequences === false) {
      indentBlockSequences = false;
    }
    if (objectOptions.indicatorValueIndent != null) {
      indicatorValueIndent = objectOptions.indicatorValueIndent;
    }
    if (objectOptions.alignMultilineFlowScalars != null) {
      alignMultilineFlowScalars = objectOptions.alignMultilineFlowScalars;
    }
  }
  return {
    numOfIndent,
    indentBlockSequences,
    indicatorValueIndent,
    alignMultilineFlowScalars,
  };
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
      {
        type: "object",
        properties: {
          indentBlockSequences: { type: "boolean" },
          indicatorValueIndent: {
            type: "integer",
            minimum: 2,
          },
          alignMultilineFlowScalars: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongIndentation:
        "Expected indentation of {{expected}} spaces but found {{actual}} spaces.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    if (hasTabIndent(context)) {
      // cannot check
      return {};
    }

    const {
      numOfIndent,
      indentBlockSequences,
      indicatorValueIndent,
      alignMultilineFlowScalars,
    } = parseOptions(context);

    const indents = new Map<YAMLToken, IndentInfo>();
    const indicators = new Set<YAMLToken>();
    const blockLiteralMarks = new Set<YAMLToken>();
    const scalars = new Map<YAMLToken, AST.YAMLScalar>();

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
      setIndent(
        token,
        offset * numOfIndent,
        baseToken,
        options && {
          indentWhenBaseIsNotFirst:
            options.offsetWhenBaseIsNotFirst &&
            options.offsetWhenBaseIsNotFirst * numOfIndent,
        },
      );
    }

    /**
     * Set indent to the given tokens.
     * @param token The token to set.
     * @param indent The indent of the tokens.
     * @param baseToken The token of the base indent.
     */
    function setIndent(
      token: YAMLToken | (YAMLToken | null)[] | null,
      indent: number,
      baseToken: YAMLToken,
      options?: { indentWhenBaseIsNotFirst?: number },
    ) {
      if (token == null) {
        return;
      }
      if (Array.isArray(token)) {
        for (const t of token) {
          setIndent(t, indent, baseToken, options);
        }
      } else {
        indents.set(token, {
          baseToken,
          indent,
          indentWhenBaseIsNotFirst: options?.indentWhenBaseIsNotFirst ?? null,
        });
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
      let lastToken = left;

      const alignTokens = new Set<YAMLToken>();
      for (const node of nodeList) {
        if (node == null) {
          // Holes of an array.
          continue;
        }
        const elementTokens = {
          firstToken: sourceCode.getFirstToken(node),
          lastToken: sourceCode.getLastToken(node),
        };

        // Collect comma/comment tokens between the last token of the previous node and the first token of this node.
        let t: YAMLToken | null = lastToken;
        while (
          (t = sourceCode.getTokenAfter(t, ITERATION_OPTS)) != null &&
          t.range[1] <= elementTokens.firstToken.range[0]
        ) {
          alignTokens.add(t);
        }

        alignTokens.add(elementTokens.firstToken);

        // Save the last token to find tokens between this node and the next node.
        lastToken = elementTokens.lastToken;
      }

      // Check trailing commas and comments.
      if (right != null) {
        let t: YAMLToken | null = lastToken;
        while (
          (t = sourceCode.getTokenAfter(t, ITERATION_OPTS)) != null &&
          t.range[1] <= right.range[0]
        ) {
          alignTokens.add(t);
        }
      }

      alignTokens.delete(left);

      // Set offsets.
      setOffset([...alignTokens], offset, left);

      if (right != null) {
        setOffset(right, 0, left);
      }
    }

    /**
     * Calculate the indentation for the values in the mapping.
     */
    function calcMappingPairValueIndent(
      node: AST.YAMLWithMeta | AST.YAMLContent,
      indent: number,
    ) {
      if (indentBlockSequences) {
        return indent;
      }
      if (node.type === "YAMLSequence" && node.style === "block") {
        return 0;
      }
      return indent;
    }

    /**
     * Calculate the indentation for the values in the indicator.
     */
    function calcIndicatorValueIndent(token: YAMLToken) {
      return isBeginningToken(token) ? indicatorValueIndent : numOfIndent;
    }

    /**
     * Checks whether the given token is a beginning token.
     */
    function isBeginningToken(token: YAMLToken) {
      const before = sourceCode.getTokenBefore(
        token,
        (t) => !indicators.has(t),
      );
      if (!before) return true;

      return before.loc.end.line < token.loc.start.line;
    }

    const documents: AST.YAMLDocument[] = [];
    return {
      YAMLDocument(node) {
        documents.push(node);
        const first = sourceCode.getFirstToken(node, ITERATION_OPTS);
        if (!first) {
          return;
        }

        indents.set(first, {
          baseToken: null,
          indentWhenBaseIsNotFirst: null,
          indent: 0,
          expectedIndent: 0,
        });
        processNodeList([...node.directives, node.content], first, null, 0);
      },
      YAMLMapping(node) {
        if (node.style === "flow") {
          // | {
          // |   a: b,
          // |   c: d
          // | }
          const open = sourceCode.getFirstToken(node);
          const close = sourceCode.getLastToken(node);
          processNodeList(node.pairs, open, close, 1);
        } else if (node.style === "block") {
          // | a: b
          // | c: d
          const first = sourceCode.getFirstToken(node);
          processNodeList(node.pairs, first, null, 0);
        }
      },
      YAMLSequence(node) {
        if (node.style === "flow") {
          // | [
          // |   a,
          // |   b
          // | ]
          const open = sourceCode.getFirstToken(node);
          const close = sourceCode.getLastToken(node);
          processNodeList(node.entries, open, close, 1);
        } else if (node.style === "block") {
          // | - a
          // | - b
          const first = sourceCode.getFirstToken(node);
          processNodeList(node.entries, first, null, 0);
          for (const entry of node.entries) {
            if (!entry) {
              continue;
            }
            const hyphen = sourceCode.getTokenBefore(entry, isHyphen)!;
            indicators.add(hyphen);
            // | -
            // |   a
            const entryToken = sourceCode.getFirstToken(entry);
            setIndent(entryToken, calcIndicatorValueIndent(hyphen), hyphen);
          }
        }
      },

      YAMLPair(node) {
        const pairFirst = sourceCode.getFirstToken(node);
        const keyToken = node.key && sourceCode.getFirstToken(node.key);
        const colonToken = findColonToken();

        const questionToken = isQuestion(pairFirst) ? pairFirst : null;
        if (questionToken) {
          // ? a: b
          indicators.add(questionToken);

          if (node.key) {
            setIndent(
              keyToken,
              calcMappingPairValueIndent(
                node.key,
                calcIndicatorValueIndent(questionToken),
              ),
              questionToken,
            );
          }
        }

        if (colonToken) {
          indicators.add(colonToken);
          if (questionToken) {
            setOffset(colonToken, 0, questionToken, {
              offsetWhenBaseIsNotFirst: 1,
            });
          } else if (keyToken) {
            setOffset(colonToken, 1, keyToken);
          }
        }
        if (node.value) {
          const valueToken = sourceCode.getFirstToken(node.value);
          if (colonToken) {
            setIndent(
              valueToken,
              calcMappingPairValueIndent(
                node.value,
                calcIndicatorValueIndent(colonToken),
              ),
              colonToken,
            );
          } else if (keyToken) {
            // Probably not reach.
            setOffset(valueToken, 1, keyToken);
          }
        }

        /** Find colon indicator token */
        function findColonToken() {
          if (node.value) {
            return sourceCode.getTokenBefore(node.value, isColon);
          }
          if (node.key) {
            const token = sourceCode.getTokenAfter(node.key, isColon);
            if (token && token.range[0] < node.range[1]) {
              return token;
            }
          }
          const tokens = sourceCode.getTokens(node, isColon);
          if (tokens.length) {
            return tokens[0];
          }
          return null;
        }
      },
      YAMLWithMeta(node) {
        const anchorToken =
          node.anchor && sourceCode.getFirstToken(node.anchor);
        const tagToken = node.tag && sourceCode.getFirstToken(node.tag);

        let baseToken: YAMLToken;
        if (anchorToken && tagToken) {
          if (anchorToken.range[0] < tagToken.range[0]) {
            setOffset(tagToken, 0, anchorToken, {
              offsetWhenBaseIsNotFirst: 1,
            });
            baseToken = anchorToken;
          } else {
            setOffset(anchorToken, 0, tagToken, {
              offsetWhenBaseIsNotFirst: 1,
            });
            baseToken = tagToken;
          }
        } else {
          baseToken = (anchorToken || tagToken)!;
        }
        if (node.value) {
          const valueToken = sourceCode.getFirstToken(node.value);
          setOffset(valueToken, 1, baseToken);
        }
      },
      YAMLScalar(node) {
        if (node.style === "folded" || node.style === "literal") {
          if (!node.value.trim()) {
            // ignore blank
            return;
          }
          const mark = sourceCode.getFirstToken(node);
          const literal = sourceCode.getLastToken(node);
          setOffset(literal, 1, mark);
          scalars.set(literal, node);
          blockLiteralMarks.add(mark);
        } else {
          scalars.set(sourceCode.getFirstToken(node), node);
        }
      },
      "Program:exit"(node) {
        const lineIndentsWk: (LineIndentStep1 | undefined)[] = [];
        let tokensOnSameLine: YAMLToken[] = [];
        // Validate indentation of tokens.
        for (const token of sourceCode.getTokens(node, ITERATION_OPTS)) {
          if (
            tokensOnSameLine.length === 0 ||
            tokensOnSameLine[0].loc.start.line === token.loc.start.line
          ) {
            // This is on the same line (or the first token).
            tokensOnSameLine.push(token);
          } else {
            // New line is detected, so validate the tokens.
            const lineIndent = processExpectedIndent(tokensOnSameLine);
            lineIndentsWk[lineIndent.line] = lineIndent;
            tokensOnSameLine = [token];
          }
        }
        if (tokensOnSameLine.length >= 1) {
          const lineIndent = processExpectedIndent(tokensOnSameLine);
          lineIndentsWk[lineIndent.line] = lineIndent;
        }
        const lineIndents = processMissingLines(lineIndentsWk);

        validateLines(lineIndents);
      },
    };

    /* eslint-disable complexity -- X( */
    /**
     * Process the expected indent for given line tokens
     */
    function processExpectedIndent(
      /* eslint-enable complexity -- X( */
      lineTokens: YAMLToken[],
    ): LineIndentStep1 {
      const lastToken = lineTokens[lineTokens.length - 1];
      let lineExpectedIndent: number | null = null;
      let cacheExpectedIndent: number | null = null;
      const indicatorData: LineIndentIndicatorData[] = [];
      const firstToken = lineTokens.shift()!;
      let token: YAMLToken | undefined = firstToken;
      let expectedIndent = getExpectedIndent(token);
      if (expectedIndent != null) {
        lineExpectedIndent = expectedIndent;
        cacheExpectedIndent = expectedIndent;
      }
      while (token && indicators.has(token) && expectedIndent != null) {
        const nextToken = lineTokens.shift();
        if (!nextToken) {
          break;
        }
        const nextExpectedIndent = getExpectedIndent(nextToken);
        if (
          nextExpectedIndent == null ||
          expectedIndent >= nextExpectedIndent
        ) {
          lineTokens.unshift(nextToken);
          break;
        }
        indicatorData.push({
          indicator: token,
          next: nextToken,
          expectedOffset:
            nextExpectedIndent - expectedIndent - 1 /* "-" or "?" or ":" */,
          actualOffset: nextToken.range[0] - token.range[1],
        });
        if (blockLiteralMarks.has(nextToken)) {
          // For block literal mark token.
          // e.g.
          //
          // - |
          //   text
          //   text
          lineTokens.unshift(nextToken);
          break;
        }
        // For other tokens.
        // e.g.
        //
        // - [
        //     text
        //     text
        //   ]
        token = nextToken;
        expectedIndent = nextExpectedIndent;
        cacheExpectedIndent = expectedIndent;
      }

      if (lineExpectedIndent == null) {
        while ((token = lineTokens.shift()) != null) {
          lineExpectedIndent = getExpectedIndent(token);
          if (lineExpectedIndent != null) {
            break;
          }
        }
      }

      const scalarNode = scalars.get(lastToken);
      if (scalarNode) {
        lineTokens.pop();
      }

      if (cacheExpectedIndent != null) {
        // Sets the indent cache for the tokens behind this line.
        while ((token = lineTokens.shift()) != null) {
          const indent = indents.get(token);
          if (indent) {
            indent.expectedIndent = cacheExpectedIndent;
          }
        }
      }

      let lastScalar: LineIndentLastScalarData | null = null;

      if (scalarNode) {
        const expectedScalarIndent = getExpectedIndent(lastToken);
        if (expectedScalarIndent != null) {
          lastScalar = {
            expectedIndent: expectedScalarIndent,
            token: lastToken,
            node: scalarNode,
          };
        }
      }
      const { line, column } = firstToken.loc.start;

      return {
        expectedIndent: lineExpectedIndent,
        actualIndent: column,
        firstToken,
        line,
        indicatorData,
        lastScalar,
      };
    }

    /**
     * Get the expected indent from given token
     */
    function getExpectedIndent(token: YAMLToken): number | null {
      if (token.type === "Marker") {
        return 0;
      }
      const indent = indents.get(token);
      if (!indent) {
        return null;
      }
      if (indent.expectedIndent != null) {
        return indent.expectedIndent;
      }
      if (indent.baseToken == null) {
        return null;
      }
      const baseIndent = getExpectedIndent(indent.baseToken);
      if (baseIndent == null) {
        return null;
      }
      let offsetIndent = indent.indent;
      if (offsetIndent === 0 && indent.indentWhenBaseIsNotFirst != null) {
        let before: YAMLToken | null = indent.baseToken;
        while (
          (before = sourceCode.getTokenBefore(before, ITERATION_OPTS)) != null
        ) {
          if (!indicators.has(before)) {
            break;
          }
        }
        if (before?.loc.end.line === indent.baseToken.loc.start.line) {
          // base token is not first
          offsetIndent = indent.indentWhenBaseIsNotFirst;
        }
      }
      return (indent.expectedIndent = baseIndent + offsetIndent);
    }

    /**
     * Calculates the indent for lines with missing indent information.
     */
    function processMissingLines(lineIndents: (LineIndentStep1 | undefined)[]) {
      const results: (LineIndentStep2 | undefined)[] = [];
      const commentLines: {
        range: [number, number];
        commentLineIndents: LineIndentStep1[];
      }[] = [];
      for (const lineIndent of lineIndents) {
        if (!lineIndent) {
          continue;
        }
        const line = lineIndent.line;
        if (lineIndent.firstToken.type === "Block") {
          const last = commentLines[commentLines.length - 1];
          if (last && last.range[1] === line - 1) {
            last.range[1] = line;
            last.commentLineIndents.push(lineIndent);
          } else {
            commentLines.push({
              range: [line, line],
              commentLineIndents: [lineIndent],
            });
          }
        } else if (lineIndent.expectedIndent != null) {
          const indent = {
            line,
            expectedIndent: lineIndent.expectedIndent,
            actualIndent: lineIndent.actualIndent,
            indicatorData: lineIndent.indicatorData,
          };
          if (!results[line]) {
            results[line] = indent;
          }
          if (lineIndent.lastScalar) {
            const scalarNode = lineIndent.lastScalar.node;
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
              );
            } else {
              let expectedIndent = lineIndent.lastScalar.expectedIndent;
              if (alignMultilineFlowScalars) {
                if (!isBeginningToken(lineIndent.lastScalar.token)) {
                  expectedIndent = lineIndent.lastScalar.node.loc.start.column;
                }
              }
              processMultilineScalar(indent, scalarNode, expectedIndent);
            }
          }
        }
      }

      processComments(commentLines, lineIndents);

      return results;

      /**
       * Process comments.
       */
      function processComments(
        commentLines: {
          range: [number, number];
          commentLineIndents: LineIndentStep1[];
        }[],
        lineIndents: (LineIndentStep1 | undefined)[],
      ) {
        for (const { range, commentLineIndents } of commentLines) {
          let prev: LineIndentStep2 | undefined = results
            .slice(0, range[0])
            .filter((data) => data)
            .pop();
          const next: LineIndentStep2 | undefined = results
            .slice(range[1] + 1)
            .filter((data) => data)
            .shift();

          if (isBlockLiteral(prev)) {
            prev = undefined;
          }

          const expectedIndents: number[] = [];
          let either: LineIndentStep2 | undefined;
          if (prev && next) {
            expectedIndents.unshift(next.expectedIndent);
            if (next.expectedIndent < prev.expectedIndent) {
              let indent = next.expectedIndent + numOfIndent;
              while (indent <= prev.expectedIndent) {
                expectedIndents.unshift(indent);
                indent += numOfIndent;
              }
            }
          } else if ((either = prev || next)) {
            expectedIndents.unshift(either.expectedIndent);
            if (!next) {
              let indent = either.expectedIndent - numOfIndent;
              while (indent >= 0) {
                expectedIndents.push(indent);
                indent -= numOfIndent;
              }
            }
          }
          if (!expectedIndents.length) {
            continue;
          }

          let expectedIndent = expectedIndents[0];
          for (const commentLineIndent of commentLineIndents) {
            if (results[commentLineIndent.line]) {
              continue;
            }
            expectedIndent = Math.min(
              expectedIndents.find((indent, index) => {
                if (indent <= commentLineIndent.actualIndent) {
                  return true;
                }
                const prev = expectedIndents[index + 1] ?? -1;
                return (
                  prev < commentLineIndent.actualIndent &&
                  commentLineIndent.actualIndent < indent
                );
              }) ?? expectedIndent,
              expectedIndent,
            );
            results[commentLineIndent.line] = {
              line: commentLineIndent.line,
              expectedIndent,
              actualIndent: commentLineIndent.actualIndent,
              indicatorData: commentLineIndent.indicatorData,
            };
          }
        }

        /**
         * Checks whether given prev data is block literal
         */
        function isBlockLiteral(prev: LineIndentStep2 | undefined): boolean {
          if (!prev) {
            return false;
          }
          for (let prevLine = prev.line; prevLine >= 0; prevLine--) {
            const prevLineIndent = lineIndents[prev.line];
            if (!prevLineIndent) {
              continue;
            }
            if (prevLineIndent.lastScalar) {
              const scalarNode = prevLineIndent.lastScalar.node;
              if (
                scalarNode.style === "literal" ||
                scalarNode.style === "folded"
              ) {
                if (
                  scalarNode.loc.start.line <= prev.line &&
                  prev.line <= scalarNode.loc.end.line
                ) {
                  return true;
                }
              }
            }
            return false;
          }
          return false;
        }
      }

      /**
       * Process block literal
       */
      function processBlockLiteral(
        lineIndent: LineIndentStep2,
        scalarNode: AST.YAMLBlockLiteralScalar | AST.YAMLBlockFoldedScalar,
        expectedIndent: number,
      ) {
        if (scalarNode.indent != null) {
          if (lineIndent.expectedIndent < lineIndent.actualIndent) {
            // no check
            lineIndent.expectedIndent = lineIndent.actualIndent;
            return;
          }

          lineIndent.indentBlockScalar = {
            node: scalarNode,
          };
        }
        const firstLineActualIndent = lineIndent.actualIndent;

        for (
          let scalarLine = lineIndent.line + 1;
          scalarLine <= scalarNode.loc.end.line;
          scalarLine++
        ) {
          const actualLineIndent = getActualLineIndent(scalarLine);
          if (actualLineIndent == null) {
            continue;
          }
          const scalarActualIndent = Math.min(
            firstLineActualIndent,
            actualLineIndent,
          );
          results[scalarLine] = {
            line: scalarLine,
            expectedIndent,
            actualIndent: scalarActualIndent,
            indicatorData: [],
          };
        }
      }

      /**
       * Process for a multiline-scalar
       */
      function processMultilineScalar(
        lineIndent: LineIndentStep2,
        scalarNode: AST.YAMLScalar,
        expectedIndent: number,
      ) {
        for (
          let scalarLine = lineIndent.line + 1;
          scalarLine <= scalarNode.loc.end.line;
          scalarLine++
        ) {
          const scalarActualIndent = getActualLineIndent(scalarLine);
          if (scalarActualIndent == null) {
            continue;
          }
          results[scalarLine] = {
            line: scalarLine,
            expectedIndent,
            actualIndent: scalarActualIndent,
            indicatorData: [],
          };
        }
      }
    }

    /**
     * Validate lines
     */
    function validateLines(lineIndents: (LineIndentStep2 | undefined)[]) {
      for (const lineIndent of lineIndents) {
        if (!lineIndent) {
          continue;
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
          });
        } else if (lineIndent.indicatorData.length) {
          for (const indicatorData of lineIndent.indicatorData) {
            if (indicatorData.actualOffset !== indicatorData.expectedOffset) {
              const indicatorLoc = indicatorData.indicator.loc.end;
              const loc = indicatorData.next.loc.start;

              context.report({
                loc: {
                  start: indicatorLoc,
                  end: loc,
                },
                messageId: "wrongIndentation",
                data: {
                  expected: String(indicatorData.expectedOffset),
                  actual: String(indicatorData.actualOffset),
                },
                fix: buildFix(lineIndent, lineIndents),
              });
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
      const { line, expectedIndent } = lineIndent;
      const document =
        documents.find(
          (doc) => doc.loc.start.line <= line && line <= doc.loc.end.line,
        ) || sourceCode.ast;

      let startLine = document.loc.start.line;
      let endLine = document.loc.end.line;
      // find fixing start line
      for (
        let lineIndex = line - 1;
        lineIndex >= document.loc.start.line;
        lineIndex--
      ) {
        const li = lineIndents[lineIndex];
        if (!li) {
          continue;
        }
        if (li.expectedIndent < expectedIndent) {
          // outdent

          // If the fixed indent becomes incorrect compared to the actual indent of the previous line, the process is stopped.
          if (expectedIndent <= li.actualIndent) {
            return null;
          }
          for (const indicator of li.indicatorData) {
            if (indicator.actualOffset !== indicator.expectedOffset) {
              // If the indicator mark indentation on the previous line needs to be fixed, the process will stop.
              return null;
            }
          }
          startLine = lineIndex + 1;
          break;
        }
      }
      // find fixing end line
      for (
        let lineIndex = line + 1;
        lineIndex <= document.loc.end.line;
        lineIndex++
      ) {
        const li = lineIndents[lineIndex];
        if (!li) {
          continue;
        }
        if (li && li.expectedIndent < expectedIndent) {
          // outdent

          // If the fixed indent becomes incorrect compared to the actual indent of the next line, the process is stopped.
          if (expectedIndent <= li.actualIndent) {
            return null;
          }
          endLine = lineIndex - 1;
          break;
        }
      }
      for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
        const li = lineIndents[lineIndex];
        if (li?.indentBlockScalar) {
          const blockLiteral = li.indentBlockScalar.node;
          const diff = li.expectedIndent - li.actualIndent;
          const mark = sourceCode.getFirstToken(blockLiteral);
          const num = /\d+/u.exec(mark.value)?.[0];
          if (num != null) {
            const newIndent = Number(num) + diff;
            if (newIndent >= 10) {
              // The new indentation indicator is too big
              return null;
            }
          }
        }
      }
      return function* (fixer: RuleFixer): IterableIterator<Fix> {
        type Stack = {
          indent: number;
          parentIndent: number;
          upper: Stack;
        };
        let stacks: Stack | null = null;
        for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
          const li = lineIndents[lineIndex];
          if (!li) {
            continue;
          }
          const lineExpectedIndent = li.expectedIndent;

          if (stacks == null) {
            if (li.expectedIndent !== li.actualIndent) {
              yield* fixLine(fixer, li);
            }
          } else {
            if (stacks.indent < lineExpectedIndent) {
              stacks = {
                indent: lineExpectedIndent,
                parentIndent: stacks.indent,
                upper: stacks,
              };
            } else if (lineExpectedIndent < stacks.indent) {
              stacks = stacks.upper;
            }

            // Check if indentation is needed.
            // |  a: # stacks.parentIndent
            // | b # li.actualIndent
            if (li.actualIndent <= stacks.parentIndent) {
              yield* fixLine(fixer, li);
            }
          }

          // hyphen
          if (li.indicatorData) {
            for (const indicatorData of li.indicatorData) {
              yield fixer.replaceTextRange(
                [indicatorData.indicator.range[1], indicatorData.next.range[0]],
                " ".repeat(indicatorData.expectedOffset),
              );
            }
          }
        }
      };
    }

    /**
     * Fix a line
     */
    function* fixLine(fixer: RuleFixer, li: LineIndentStep2) {
      if (li.indentBlockScalar) {
        const blockLiteral = li.indentBlockScalar.node;
        const diff = li.expectedIndent - li.actualIndent;
        const mark = sourceCode.getFirstToken(blockLiteral);
        yield fixer.replaceText(
          mark,
          mark.value.replace(/\d+/u, (num: string) => `${Number(num) + diff}`),
        );
      }
      const expectedIndent = li.expectedIndent;
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
      );
    }

    /**
     * Get actual indent from given line
     */
    function getActualLineIndent(line: number) {
      const lineText = sourceCode.lines[line - 1];
      if (!lineText.length) {
        return null;
      }
      return /^\s*/u.exec(lineText)![0].length;
    }
  },
});
