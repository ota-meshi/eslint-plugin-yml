import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index";
import { getSourceCode } from "../utils/compat";
import { isTokenOnSameLine } from "../utils/ast-utils";

interface Schema1 {
  singleValue?: boolean;
  objectsInArrays?: boolean;
  arraysInArrays?: boolean;
}
export default createRule("flow-sequence-bracket-spacing", {
  meta: {
    docs: {
      description: "enforce consistent spacing inside flow sequence brackets",
      categories: ["standard"],
      extensionRule: "array-bracket-spacing",
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
          singleValue: {
            type: "boolean",
          },
          objectsInArrays: {
            type: "boolean",
          },
          arraysInArrays: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedSpaceAfter: "There should be no space after '{{tokenValue}}'.",
      unexpectedSpaceBefore:
        "There should be no space before '{{tokenValue}}'.",
      missingSpaceAfter: "A space is required after '{{tokenValue}}'.",
      missingSpaceBefore: "A space is required before '{{tokenValue}}'.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isYAML) {
      return {};
    }

    const spaced = context.options[0] === "always";

    /**
     * Determines whether an option is set, relative to the spacing option.
     * If spaced is "always", then check whether option is set to false.
     * If spaced is "never", then check whether option is set to true.
     * @param option The option to exclude.
     * @returns Whether or not the property is excluded.
     */
    function isOptionSet(option: keyof NonNullable<Schema1>) {
      return context.options[1]
        ? context.options[1][option] === !spaced
        : false;
    }

    const options = {
      spaced,
      singleElementException: isOptionSet("singleValue"),
      objectsInArraysException: isOptionSet("objectsInArrays"),
      arraysInArraysException: isOptionSet("arraysInArrays"),
      isOpeningBracketMustBeSpaced(node: AST.YAMLSequence) {
        if (options.singleElementException && node.entries.length === 1) {
          return !options.spaced;
        }
        const firstElement = node.entries[0];
        return firstElement &&
          ((options.objectsInArraysException && isObjectType(firstElement)) ||
            (options.arraysInArraysException && isArrayType(firstElement)))
          ? !options.spaced
          : options.spaced;
      },
      isClosingBracketMustBeSpaced(node: AST.YAMLSequence) {
        if (options.singleElementException && node.entries.length === 1) {
          return !options.spaced;
        }
        const lastElement = node.entries[node.entries.length - 1];
        return lastElement &&
          ((options.objectsInArraysException && isObjectType(lastElement)) ||
            (options.arraysInArraysException && isArrayType(lastElement)))
          ? !options.spaced
          : options.spaced;
      },
    };

    /**
     * Reports that there shouldn't be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoBeginningSpace(node: AST.YAMLNode, token: AST.Token) {
      const nextToken = sourceCode.getTokenAfter(token)!;

      context.report({
        node,
        loc: { start: token.loc.end, end: nextToken.loc.start },
        messageId: "unexpectedSpaceAfter",
        data: {
          tokenValue: token.value,
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
    function reportNoEndingSpace(node: AST.YAMLNode, token: AST.Token) {
      const previousToken = sourceCode.getTokenBefore(token)!;

      context.report({
        node,
        loc: { start: previousToken.loc.end, end: token.loc.start },
        messageId: "unexpectedSpaceBefore",
        data: {
          tokenValue: token.value,
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
        messageId: "missingSpaceAfter",
        data: {
          tokenValue: token.value,
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
    function reportRequiredEndingSpace(node: AST.YAMLNode, token: AST.Token) {
      context.report({
        node,
        loc: token.loc,
        messageId: "missingSpaceBefore",
        data: {
          tokenValue: token.value,
        },
        fix(fixer) {
          return fixer.insertTextBefore(token, " ");
        },
      });
    }

    /**
     * Determines if a node is an object type
     * @param node The node to check.
     * @returns Whether or not the node is an object type.
     */
    function isObjectType(node: AST.YAMLNode) {
      return node && node.type === "YAMLMapping";
    }

    /**
     * Determines if a node is an array type
     * @param node The node to check.
     * @returns Whether or not the node is an array type.
     */
    function isArrayType(node: AST.YAMLNode) {
      return node && node.type === "YAMLSequence";
    }

    /**
     * Validates the spacing around array brackets
     * @param node The node we're checking for spacing
     */
    function validateArraySpacing(node: AST.YAMLSequence) {
      if (options.spaced && node.entries.length === 0) return;

      const first = sourceCode.getFirstToken(node);
      const last = sourceCode.getLastToken(node);
      const second = sourceCode.getTokenAfter(first, {
        includeComments: true,
      })!;
      const penultimate = sourceCode.getTokenBefore(last, {
        includeComments: true,
      })!;

      if (isTokenOnSameLine(first, second)) {
        if (options.isOpeningBracketMustBeSpaced(node)) {
          if (!sourceCode.isSpaceBetweenTokens(first, second))
            reportRequiredBeginningSpace(node, first);
        } else {
          if (sourceCode.isSpaceBetweenTokens(first, second))
            reportNoBeginningSpace(node, first);
        }
      }

      if (first !== penultimate && isTokenOnSameLine(penultimate, last)) {
        if (options.isClosingBracketMustBeSpaced(node)) {
          if (!sourceCode.isSpaceBetweenTokens(penultimate, last))
            reportRequiredEndingSpace(node, last);
        } else {
          if (sourceCode.isSpaceBetweenTokens(penultimate, last))
            reportNoEndingSpace(node, last);
        }
      }
    }

    return {
      YAMLSequence(node) {
        if (node.style === "flow") {
          validateArraySpacing(node);
        }
      },
    };
  },
});
