import { createRule } from "../utils/index.js";
import type { AST } from "yaml-eslint-parser";
import {
  isClosingBraceToken,
  isClosingBracketToken,
  isOpeningBraceToken,
  isOpeningBracketToken,
  isTokenOnSameLine,
  isCommentToken,
} from "../utils/ast-utils.js";
import type { YAMLToken } from "../types.js";
import type { YAMLSourceCode } from "../language/yaml-source-code.js";

interface Schema1 {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
  emptyObjects?: "ignore" | "always" | "never";
}

/**
 * Parse rule options and return helpers for spacing checks.
 * @param options The options tuple from the rule configuration.
 * @param sourceCode The sourceCode object for node lookup.
 */
function parseOptions(
  options: [("always" | "never")?, Schema1?],
  sourceCode: YAMLSourceCode,
) {
  const spaced = options[0] ?? "never";

  /**
   * Determines whether an exception option is set relative to the base spacing.
   * @param option The option to check.
   */
  function isOptionSet(
    option: "arraysInObjects" | "objectsInObjects",
  ): boolean {
    return options[1] ? options[1][option] === (spaced === "never") : false;
  }

  const arraysInObjectsException = isOptionSet("arraysInObjects");
  const objectsInObjectsException = isOptionSet("objectsInObjects");
  const emptyObjects = options[1]?.emptyObjects ?? "ignore";

  /**
   * Whether the opening brace must be spaced, considering exceptions.
   * @param spaced The primary spaced option string.
   * @param second The token after the opening brace.
   */
  function isOpeningCurlyBraceMustBeSpaced(
    spaced: "always" | "never",
    second: YAMLToken,
  ) {
    const targetPenultimateType =
      arraysInObjectsException && isOpeningBracketToken(second)
        ? "YAMLSequence"
        : objectsInObjectsException && isOpeningBraceToken(second)
          ? "YAMLMapping"
          : null;

    const node = sourceCode.getNodeByRangeIndex(second.range[0]);

    return targetPenultimateType && node?.type === targetPenultimateType
      ? spaced === "never"
      : spaced === "always";
  }

  /**
   * Whether the closing brace must be spaced, considering exceptions.
   * @param spaced The primary spaced option string.
   * @param penultimate The token before the closing brace.
   */
  function isClosingCurlyBraceMustBeSpaced(
    spaced: "always" | "never",
    penultimate: YAMLToken,
  ) {
    const targetPenultimateType =
      arraysInObjectsException && isClosingBracketToken(penultimate)
        ? "YAMLSequence"
        : objectsInObjectsException && isClosingBraceToken(penultimate)
          ? "YAMLMapping"
          : null;

    const node = sourceCode.getNodeByRangeIndex(penultimate.range[0]);

    return targetPenultimateType && node?.type === targetPenultimateType
      ? spaced === "never"
      : spaced === "always";
  }

  return {
    spaced,
    emptyObjects,
    isOpeningCurlyBraceMustBeSpaced,
    isClosingCurlyBraceMustBeSpaced,
  };
}

export default createRule("flow-mapping-curly-spacing", {
  meta: {
    docs: {
      description: "enforce consistent spacing inside braces",
      categories: ["standard"],
      extensionRule: "object-curly-spacing",
      layout: true,
    },
    type: "layout",
    fixable: "whitespace",
    schema: [
      {
        type: "string",
        enum: ["always", "never"],
      },
      {
        type: "object",
        properties: {
          arraysInObjects: {
            type: "boolean",
          },
          objectsInObjects: {
            type: "boolean",
          },
          emptyObjects: {
            type: "string",
            enum: ["ignore", "always", "never"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireSpaceBefore: "A space is required before '{{token}}'.",
      requireSpaceAfter: "A space is required after '{{token}}'.",
      unexpectedSpaceBefore: "There should be no space before '{{token}}'.",
      unexpectedSpaceAfter: "There should be no space after '{{token}}'.",
      requiredSpaceInEmptyObject: "A space is required in empty flow mapping.",
      unexpectedSpaceInEmptyObject:
        "There should be no space in empty flow mapping.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    const options = parseOptions(
      context.options as [("always" | "never")?, Schema1?],
      sourceCode,
    );

    /**
     * Reports that there shouldn't be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoBeginningSpace(node: AST.YAMLNode, token: AST.Token) {
      const nextToken = sourceCode.getTokenAfter(token, {
        includeComments: true,
      })!;

      context.report({
        node,
        loc: { start: token.loc.end, end: nextToken.loc.start },
        messageId: "unexpectedSpaceAfter",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([token.range[1], nextToken.range[0]]);
        },
      });
    }

    /**
     * Reports that there shouldn't be a space before the last token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoEndingSpace(node: AST.YAMLNode, token: YAMLToken) {
      const previousToken = sourceCode.getTokenBefore(token, {
        includeComments: true,
      })!;

      context.report({
        node,
        loc: { start: previousToken.loc.end, end: token.loc.start },
        messageId: "unexpectedSpaceBefore",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([previousToken.range[1], token.range[0]]);
        },
      });
    }

    /**
     * Reports that there should be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportRequiredBeginningSpace(
      node: AST.YAMLNode,
      token: AST.Token,
    ) {
      context.report({
        node,
        loc: token.loc,
        messageId: "requireSpaceAfter",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.insertTextAfter(token, " ");
        },
      });
    }

    /**
     * Reports that there should be a space before the last token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportRequiredEndingSpace(node: AST.YAMLNode, token: YAMLToken) {
      context.report({
        node,
        loc: token.loc,
        messageId: "requireSpaceBefore",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.insertTextBefore(token, " ");
        },
      });
    }

    /**
     * Determines if spacing in curly braces is valid.
     * @param node The AST node to check.
     * @param first The first token to check (should be the opening brace)
     * @param second The second token to check (should be first after the opening brace)
     * @param penultimate The penultimate token to check (should be last before closing brace)
     * @param last The last token to check (should be closing brace)
     */
    function validateBraceSpacing(
      node: AST.YAMLNode,
      spaced: "always" | "never",
      openingToken: AST.Token,
      second: YAMLToken,
      penultimate: YAMLToken,
      closingToken: YAMLToken,
    ) {
      if (isTokenOnSameLine(openingToken, second)) {
        const firstSpaced = sourceCode.isSpaceBetween(openingToken, second);

        if (options.isOpeningCurlyBraceMustBeSpaced(spaced, second)) {
          if (!firstSpaced) reportRequiredBeginningSpace(node, openingToken);
        } else {
          if (firstSpaced && second.type !== "Line")
            reportNoBeginningSpace(node, openingToken);
        }
      }

      if (isTokenOnSameLine(penultimate, closingToken)) {
        const lastSpaced = sourceCode.isSpaceBetween(penultimate, closingToken);

        if (options.isClosingCurlyBraceMustBeSpaced(spaced, penultimate)) {
          if (!lastSpaced) reportRequiredEndingSpace(node, closingToken);
        } else {
          if (lastSpaced) reportNoEndingSpace(node, closingToken);
        }
      }
    }

    /**
     * Gets '}' token of an object node.
     *
     * Because the last token of object patterns might be a type annotation,
     * this traverses tokens preceded by the last property, then returns the
     * first '}' token.
     * @param node The node to get. This node is an
     *      ObjectExpression or an ObjectPattern. And this node has one or
     *      more properties.
     * @returns '}' token.
     */
    function getClosingBraceOfObject(node: AST.YAMLMapping) {
      const lastProperty = node.pairs[node.pairs.length - 1];

      return sourceCode.getTokenAfter(lastProperty, isClosingBraceToken);
    }

    /**
     * Reports a given object node if spacing in curly braces is invalid.
     * @param node An ObjectExpression or ObjectPattern node to check.
     */
    function checkSpaceInEmptyObject(node: AST.YAMLMapping) {
      if (options.emptyObjects === "ignore") {
        return;
      }

      const openingToken = sourceCode.getFirstToken(node);
      const closingToken = sourceCode.getLastToken(node);

      const second = sourceCode.getTokenAfter(openingToken, {
        includeComments: true,
      })!;
      if (second !== closingToken && isCommentToken(second)) {
        const penultimate = sourceCode.getTokenBefore(closingToken, {
          includeComments: true,
        })!;
        validateBraceSpacing(
          node,
          options.emptyObjects,
          openingToken,
          second,
          penultimate,
          closingToken,
        );
        return;
      }
      if (!isTokenOnSameLine(openingToken, closingToken)) return;

      const sourceBetween = sourceCode.text.slice(
        openingToken.range[1],
        closingToken.range[0],
      );
      if (sourceBetween.trim() !== "") {
        return;
      }

      if (options.emptyObjects === "always") {
        if (sourceBetween) return;
        context.report({
          node,
          loc: { start: openingToken.loc.end, end: closingToken.loc.start },
          messageId: "requiredSpaceInEmptyObject",
          fix(fixer) {
            return fixer.replaceTextRange(
              [openingToken.range[1], closingToken.range[0]],
              " ",
            );
          },
        });
      } else if (options.emptyObjects === "never") {
        if (!sourceBetween) return;
        context.report({
          node,
          loc: { start: openingToken.loc.end, end: closingToken.loc.start },
          messageId: "unexpectedSpaceInEmptyObject",
          fix(fixer) {
            return fixer.removeRange([
              openingToken.range[1],
              closingToken.range[0],
            ]);
          },
        });
      }
    }

    /**
     * Reports a given mapping node if spacing in curly braces is invalid.
     * @param node A YAMLMapping node to check.
     */
    function checkForObject(node: AST.YAMLMapping) {
      if (node.pairs.length === 0) {
        checkSpaceInEmptyObject(node);
        return;
      }

      const openingToken = sourceCode.getFirstToken(node);
      const closingToken = getClosingBraceOfObject(node)!;
      const second = sourceCode.getTokenAfter(openingToken, {
        includeComments: true,
      })!;
      const penultimate = sourceCode.getTokenBefore(closingToken, {
        includeComments: true,
      })!;

      validateBraceSpacing(
        node,
        options.spaced,
        openingToken,
        second,
        penultimate,
        closingToken,
      );
    }

    return {
      YAMLMapping(node) {
        if (node.style === "flow") {
          checkForObject(node);
        }
      },
    };
  },
});
