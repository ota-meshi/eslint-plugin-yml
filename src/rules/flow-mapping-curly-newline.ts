import { createRule } from "../utils";
import type { AST } from "yaml-eslint-parser";
import type { YAMLToken } from "../types";
import {
  isCommentToken,
  isTokenOnSameLine,
  isQuestion,
} from "../utils/ast-utils";
import {
  getActualIndentFromLine,
  incIndent,
  hasTabIndent,
  isKeyNode,
} from "../utils/yaml";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

// Schema objects.
const OPTION_VALUE = {
  oneOf: [
    {
      enum: ["always", "never"],
    },
    {
      type: "object",
      properties: {
        multiline: {
          type: "boolean",
        },
        minProperties: {
          type: "integer",
          minimum: 0,
        },
        consistent: {
          type: "boolean",
        },
      },
      additionalProperties: false,
      minProperties: 1,
    },
  ],
};

/**
 * Normalizes a given option value.
 */
function normalizeOptionValue(
  value:
    | "always"
    | "never"
    | { multiline?: boolean; minProperties?: number; consistent?: boolean }
    | null
) {
  let multiline = false;
  let minProperties = Number.POSITIVE_INFINITY;
  let consistent = false;

  if (value) {
    if (value === "always") {
      minProperties = 0;
    } else if (value === "never") {
      minProperties = Number.POSITIVE_INFINITY;
    } else {
      multiline = Boolean(value.multiline);
      minProperties = value.minProperties || Number.POSITIVE_INFINITY;
      consistent = Boolean(value.consistent);
    }
  } else {
    consistent = true;
  }

  return { multiline, minProperties, consistent };
}

/**
 * Determines if ObjectExpression, ObjectPattern, ImportDeclaration or ExportNamedDeclaration
 * node needs to be checked for missing line breaks
 * @param {ASTNode} node Node under inspection
 * @param {Object} options option specific to node type
 * @param {Token} first First object property
 * @param {Token} last Last object property
 * @returns {boolean} `true` if node needs to be checked for missing line breaks
 */
function areLineBreaksRequired(
  node: AST.YAMLFlowMapping,
  options: { multiline: boolean; minProperties: number; consistent: boolean },
  first: YAMLToken,
  last: YAMLToken
) {
  const objectProperties = node.pairs;

  return (
    objectProperties.length >= options.minProperties ||
    (options.multiline &&
      objectProperties.length > 0 &&
      first.loc.start.line !== last.loc.end.line)
  );
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule("flow-mapping-curly-newline", {
  meta: {
    docs: {
      description: "enforce consistent line breaks inside braces",
      categories: ["standard"],
      extensionRule: "object-curly-newline",
      layout: true,
    },
    fixable: "whitespace",
    schema: [OPTION_VALUE],
    messages: {
      unexpectedLinebreakBeforeClosingBrace:
        "Unexpected line break before this closing brace.",
      unexpectedLinebreakAfterOpeningBrace:
        "Unexpected line break after this opening brace.",
      expectedLinebreakBeforeClosingBrace:
        "Expected a line break before this closing brace.",
      expectedLinebreakAfterOpeningBrace:
        "Expected a line break after this opening brace.",
    },
    type: "layout",
  },
  create(context) {
    if (!context.parserServices.isYAML) {
      return {};
    }

    const sourceCode = context.getSourceCode();
    const options = normalizeOptionValue(context.options[0]);

    /**
     * Reports a given node if it violated this rule.
     * @param {ASTNode} node A node to check. This is an ObjectExpression, ObjectPattern, ImportDeclaration or ExportNamedDeclaration node.
     * @returns {void}
     */
    function check(node: AST.YAMLFlowMapping) {
      if (isKeyNode(node)) {
        return;
      }
      const openBrace = sourceCode.getFirstToken(
        node,
        (token) => token.value === "{"
      )!;

      const closeBrace = sourceCode.getLastToken(
        node,
        (token) => token.value === "}"
      )!;

      let first = sourceCode.getTokenAfter(openBrace, {
        includeComments: true,
      })!;
      let last = sourceCode.getTokenBefore(closeBrace, {
        includeComments: true,
      })!;

      const needsLineBreaks = areLineBreaksRequired(node, options, first, last);

      const hasCommentsFirstToken = isCommentToken(first);
      const hasCommentsLastToken = isCommentToken(last);
      const hasQuestionsLastToken = isQuestion(last);

      // Use tokens or comments to check multiline or not.
      // But use only tokens to check whether line breaks are needed.
      // This allows:
      //     var obj = { // eslint-disable-line foo
      //         a: 1
      //     }
      first = sourceCode.getTokenAfter(openBrace)!;
      last = sourceCode.getTokenBefore(closeBrace)!;

      if (needsLineBreaks) {
        if (isTokenOnSameLine(openBrace, first)) {
          context.report({
            messageId: "expectedLinebreakAfterOpeningBrace",
            node,
            loc: openBrace.loc,
            fix(fixer) {
              if (hasCommentsFirstToken || hasTabIndent(context)) {
                return null;
              }

              const indent = incIndent(
                getActualIndentFromLine(openBrace.loc.start.line, context),
                context
              );

              return fixer.insertTextAfter(openBrace, `\n${indent}`);
            },
          });
        }
        if (isTokenOnSameLine(last, closeBrace)) {
          context.report({
            messageId: "expectedLinebreakBeforeClosingBrace",
            node,
            loc: closeBrace.loc,
            fix(fixer) {
              if (hasCommentsLastToken || hasTabIndent(context)) {
                return null;
              }

              const indent = getActualIndentFromLine(
                closeBrace.loc.start.line,
                context
              );

              return fixer.insertTextBefore(closeBrace, `\n${indent}`);
            },
          });
        }
      } else {
        const consistent = options.consistent;
        const hasLineBreakBetweenOpenBraceAndFirst = !isTokenOnSameLine(
          openBrace,
          first
        );
        const hasLineBreakBetweenCloseBraceAndLast = !isTokenOnSameLine(
          last,
          closeBrace
        );

        if (
          (!consistent && hasLineBreakBetweenOpenBraceAndFirst) ||
          (consistent &&
            hasLineBreakBetweenOpenBraceAndFirst &&
            !hasLineBreakBetweenCloseBraceAndLast)
        ) {
          context.report({
            messageId: "unexpectedLinebreakAfterOpeningBrace",
            node,
            loc: openBrace.loc,
            fix(fixer) {
              if (hasCommentsFirstToken || hasTabIndent(context)) {
                return null;
              }

              return fixer.removeRange([openBrace.range[1], first.range[0]]);
            },
          });
        }
        if (
          (!consistent && hasLineBreakBetweenCloseBraceAndLast) ||
          (consistent &&
            !hasLineBreakBetweenOpenBraceAndFirst &&
            hasLineBreakBetweenCloseBraceAndLast)
        ) {
          if (hasQuestionsLastToken) {
            // If remove the line feed after the question, the values will be changed.
            // |  ?
            // | }
            return;
          }
          context.report({
            messageId: "unexpectedLinebreakBeforeClosingBrace",
            node,
            loc: closeBrace.loc,
            fix(fixer) {
              if (hasCommentsLastToken || hasTabIndent(context)) {
                return null;
              }

              return fixer.removeRange([last.range[1], closeBrace.range[0]]);
            },
          });
        }
      }
    }

    return {
      YAMLMapping(node) {
        if (node.style === "flow") {
          check(node);
        }
      },
    };
  },
});
