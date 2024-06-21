import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index";
import {
  hasTabIndent,
  getActualIndentFromLine,
  incIndent,
  isKeyNode,
} from "../utils/yaml";
import { isTokenOnSameLine, isCommentToken } from "../utils/ast-utils";
import type { YAMLToken } from "../types";
import { getSourceCode } from "../utils/compat";

type UserOption =
  | "always"
  | "never"
  | "consistent"
  | {
      multiline?: boolean;
      minItems?: number | null;
    };

export default createRule("flow-sequence-bracket-newline", {
  meta: {
    docs: {
      description:
        "enforce linebreaks after opening and before closing flow sequence brackets",
      categories: ["standard"],
      extensionRule: "array-bracket-newline",
      layout: true,
    },
    fixable: "whitespace",
    schema: [
      {
        oneOf: [
          {
            enum: ["always", "never", "consistent"],
          },
          {
            type: "object",
            properties: {
              multiline: {
                type: "boolean",
              },
              minItems: {
                type: ["integer", "null"],
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
    messages: {
      unexpectedOpeningLinebreak: "There should be no linebreak after '['.",
      unexpectedClosingLinebreak: "There should be no linebreak before ']'.",
      missingOpeningLinebreak: "A linebreak is required after '['.",
      missingClosingLinebreak: "A linebreak is required before ']'.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isYAML) {
      return {};
    }

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Normalizes a given option value.
     * @param {string|Object|undefined} option An option value to parse.
     * @returns {{multiline: boolean, minItems: number}} Normalized option object.
     */
    function normalizeOptionValue(option: UserOption) {
      let consistent = false;
      let multiline = false;
      let minItems = 0;

      if (option) {
        if (option === "consistent") {
          consistent = true;
          minItems = Number.POSITIVE_INFINITY;
        } else if (
          option === "always" ||
          (typeof option !== "string" && option.minItems === 0)
        ) {
          minItems = 0;
        } else if (option === "never") {
          minItems = Number.POSITIVE_INFINITY;
        } else {
          multiline = Boolean(option.multiline);
          minItems = option.minItems || Number.POSITIVE_INFINITY;
        }
      } else {
        consistent = false;
        multiline = true;
        minItems = Number.POSITIVE_INFINITY;
      }

      return { consistent, multiline, minItems };
    }

    /**
     * Reports that there shouldn't be a linebreak after the first token
     * @param {ASTNode} node The node to report in the event of an error.
     * @param {Token} token The token to use for the report.
     * @returns {void}
     */
    function reportNoBeginningLinebreak(
      node: AST.YAMLFlowSequence,
      token: YAMLToken,
    ) {
      context.report({
        node,
        loc: token.loc,
        messageId: "unexpectedOpeningLinebreak",
        fix(fixer) {
          if (hasTabIndent(context)) {
            return null;
          }
          const nextToken = sourceCode.getTokenAfter(token, {
            includeComments: true,
          })!;

          if (isCommentToken(nextToken)) {
            return null;
          }

          return fixer.removeRange([token.range[1], nextToken.range[0]]);
        },
      });
    }

    /**
     * Reports that there shouldn't be a linebreak before the last token
     * @param {ASTNode} node The node to report in the event of an error.
     * @param {Token} token The token to use for the report.
     * @returns {void}
     */
    function reportNoEndingLinebreak(
      node: AST.YAMLFlowSequence,
      token: YAMLToken,
    ) {
      context.report({
        node,
        loc: token.loc,
        messageId: "unexpectedClosingLinebreak",
        fix(fixer) {
          if (hasTabIndent(context)) {
            return null;
          }
          const previousToken = sourceCode.getTokenBefore(token, {
            includeComments: true,
          })!;

          if (isCommentToken(previousToken)) {
            return null;
          }

          return fixer.removeRange([previousToken.range[1], token.range[0]]);
        },
      });
    }

    /**
     * Reports that there should be a linebreak after the first token
     * @param {ASTNode} node The node to report in the event of an error.
     * @param {Token} token The token to use for the report.
     * @returns {void}
     */
    function reportRequiredBeginningLinebreak(
      node: AST.YAMLFlowSequence,
      token: YAMLToken,
    ) {
      context.report({
        node,
        loc: token.loc,
        messageId: "missingOpeningLinebreak",
        fix(fixer) {
          if (hasTabIndent(context)) {
            return null;
          }

          const indent = incIndent(
            getActualIndentFromLine(token.loc.start.line, context),
            context,
          );
          return fixer.insertTextAfter(token, `\n${indent}`);
        },
      });
    }

    /**
     * Reports that there should be a linebreak before the last token
     * @param {ASTNode} node The node to report in the event of an error.
     * @param {Token} token The token to use for the report.
     * @returns {void}
     */
    function reportRequiredEndingLinebreak(
      node: AST.YAMLFlowSequence,
      token: YAMLToken,
    ) {
      context.report({
        node,
        loc: token.loc,
        messageId: "missingClosingLinebreak",
        fix(fixer) {
          if (hasTabIndent(context)) {
            return null;
          }
          const indent = getActualIndentFromLine(token.loc.start.line, context);
          return fixer.insertTextBefore(token, `\n${indent}`);
        },
      });
    }

    /**
     * Reports a given node if it violated this rule.
     * @param {ASTNode} node A node to check. This is an ArrayExpression node or an ArrayPattern node.
     * @returns {void}
     */
    function check(node: AST.YAMLFlowSequence) {
      if (isKeyNode(node)) {
        return;
      }
      const elements = node.entries;
      const options = normalizeOptionValue(context.options[0]);
      const openBracket = sourceCode.getFirstToken(node);
      const closeBracket = sourceCode.getLastToken(node);
      const firstIncComment = sourceCode.getTokenAfter(openBracket, {
        includeComments: true,
      })!;
      const lastIncComment = sourceCode.getTokenBefore(closeBracket, {
        includeComments: true,
      })!;
      const first = sourceCode.getTokenAfter(openBracket)!;
      const last = sourceCode.getTokenBefore(closeBracket)!;

      const needsLinebreaks =
        elements.length >= options.minItems ||
        (options.multiline &&
          elements.length > 0 &&
          firstIncComment.loc.start.line !== lastIncComment.loc.end.line) ||
        (elements.length === 0 &&
          firstIncComment.type === "Block" &&
          firstIncComment.loc.start.line !== lastIncComment.loc.end.line &&
          firstIncComment === lastIncComment) ||
        (options.consistent &&
          openBracket.loc.end.line !== first.loc.start.line);

      // Use tokens or comments to check multiline or not.
      // But use only tokens to check whether linebreaks are needed.
      // This allows:
      //     var arr = [ // eslint-disable-line foo
      //         'a'
      //     ]

      if (needsLinebreaks) {
        if (isTokenOnSameLine(openBracket, first)) {
          reportRequiredBeginningLinebreak(node, openBracket);
        }
        if (isTokenOnSameLine(last, closeBracket)) {
          reportRequiredEndingLinebreak(node, closeBracket);
        }
      } else {
        if (!isTokenOnSameLine(openBracket, first)) {
          reportNoBeginningLinebreak(node, openBracket);
        }
        if (!isTokenOnSameLine(last, closeBracket)) {
          reportNoEndingLinebreak(node, closeBracket);
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      YAMLSequence(node) {
        if (node.style === "flow") {
          check(node);
        }
      },
    };
  },
});
