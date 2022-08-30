import type { AST } from "yaml-eslint-parser";
import type { YAMLNodeOrToken, RuleFixer, Fix, RuleContext } from "../types";
import { createRule } from "../utils";
import { isColon, isComma } from "../utils/ast-utils";
import {
  calcExpectIndentForPairs,
  hasTabIndent,
  isKeyNode,
  unwrapMeta,
  processIndentFix,
} from "../utils/yaml";

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

type OptionType = "always" | "never" | "ignore";
const OPTIONS_ENUM: OptionType[] = ["always", "never", "ignore"];

/**
 * Parse options
 */
function parseOptions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- option
  option: any
): {
  singleline: OptionType;
  multiline: OptionType;
} {
  const opt: {
    singleline: OptionType;
    multiline: OptionType;
  } = {
    singleline: "ignore",
    multiline: "always",
  };

  if (option) {
    if (typeof option === "string") {
      opt.singleline = option as OptionType;
      opt.multiline = option as OptionType;
    } else {
      if (typeof option.singleline === "string") {
        opt.singleline = option.singleline;
      }
      if (typeof option.multiline === "string") {
        opt.multiline = option.multiline;
      }
    }
  }
  return opt;
}

type Stack = {
  upper: Stack | null;
  node:
    | AST.YAMLMapping
    | AST.YAMLSequence
    | AST.YAMLFlowMapping
    | AST.YAMLFlowSequence;
  blockStyle: boolean;
  flowStyle: boolean;
  hasNullPair?: boolean;
  hasBlockLiteralOrFolded?: boolean;
  hasBlockStyle?: boolean;
  hasFlowStyle?: boolean;
  withinBlockStyle: boolean;
  withinFlowStyle: boolean;
};

export default createRule("block-mapping", {
  meta: {
    docs: {
      description: "require or disallow block style mappings.",
      categories: ["standard"],
      extensionRule: false,
      layout: false, // This rule does not conflict with Prettier.
    },
    fixable: "code",
    schema: [
      {
        anyOf: [
          { enum: ["always", "never"] },
          {
            type: "object",
            properties: {
              singleline: { enum: OPTIONS_ENUM },
              multiline: { enum: OPTIONS_ENUM },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
    messages: {
      required: "Must use block style mappings.",
      disallow: "Must use flow style mappings.",
    },
    type: "layout",
  },
  create(context) {
    if (!context.parserServices.isYAML) {
      return {};
    }
    const options = parseOptions(context.options[0]);
    let styleStack: Stack | null = null;

    /**
     * Moves the stack down.
     */
    function downStack(node: AST.YAMLMapping | AST.YAMLSequence) {
      if (styleStack) {
        if (node.style === "flow") {
          styleStack.hasFlowStyle = true;
        } else if (node.style === "block") {
          styleStack.hasBlockStyle = true;
        }
      }
      styleStack = {
        upper: styleStack,
        node,
        flowStyle: node.style === "flow",
        blockStyle: node.style === "block",
        withinFlowStyle:
          (styleStack &&
            (styleStack.withinFlowStyle || styleStack.flowStyle)) ||
          false,
        withinBlockStyle:
          (styleStack &&
            (styleStack.withinBlockStyle || styleStack.blockStyle)) ||
          false,
      };
    }

    /**
     * Moves the stack up.
     */
    function upStack() {
      if (styleStack && styleStack.upper) {
        styleStack.upper.hasNullPair =
          styleStack.upper.hasNullPair || styleStack.hasNullPair;
        styleStack.upper.hasBlockLiteralOrFolded =
          styleStack.upper.hasBlockLiteralOrFolded ||
          styleStack.hasBlockLiteralOrFolded;
        styleStack.upper.hasBlockStyle =
          styleStack.upper.hasBlockStyle || styleStack.hasBlockStyle;
        styleStack.upper.hasFlowStyle =
          styleStack.upper.hasFlowStyle || styleStack.hasFlowStyle;
      }
      styleStack = styleStack && styleStack.upper;
    }

    return {
      YAMLSequence: downStack,
      YAMLMapping: downStack,
      YAMLPair(node) {
        if (node.key == null || node.value == null) {
          styleStack!.hasNullPair = true;
        }
      },
      YAMLScalar(node) {
        if (
          styleStack &&
          (node.style === "folded" || node.style === "literal")
        ) {
          styleStack.hasBlockLiteralOrFolded = true;
        }
      },
      "YAMLSequence:exit": upStack,
      "YAMLMapping:exit"(node) {
        const mappingInfo = styleStack!;
        upStack();
        if (node.pairs.length === 0) {
          // ignore empty
          return;
        }
        const multiline = node.loc.start.line < node.loc.end.line;
        const optionType = multiline ? options.multiline : options.singleline;
        if (optionType === "ignore") {
          return;
        }
        if (node.style === "flow") {
          if (optionType === "never") {
            return;
          }

          if (isKeyNode(node)) {
            // This node is complex-key
            // e.g. { foo: bar }: value
            // https://yaml.org/spec/1.2/spec.html#id2780989
            return;
          }

          const canFix =
            canFixToBlock(mappingInfo, node) && !hasTabIndent(context);
          context.report({
            loc: node.loc,
            messageId: "required",
            fix: (canFix && buildFixFlowToBlock(node, context)) || null,
          });
        } else if (node.style === "block") {
          if (optionType === "always") {
            return;
          }
          const canFix =
            canFixToFlow(mappingInfo, node) && !hasTabIndent(context);
          context.report({
            loc: node.loc,
            messageId: "disallow",
            fix: (canFix && buildFixBlockToFlow(node, context)) || null,
          });
        }
      },
    };
  },
});

/**
 * Check if it can be converted to block style.
 */
function canFixToBlock(mappingInfo: Stack, node: AST.YAMLFlowMapping) {
  if (mappingInfo.hasNullPair || mappingInfo.hasBlockLiteralOrFolded) {
    return false;
  }
  if (mappingInfo.withinFlowStyle) {
    // It cannot be auto-fixed unless it is a top-level flow style.
    return false;
  }
  for (const pair of node.pairs) {
    const key = pair.key!;
    if (key.loc.start.line < key.loc.end.line) {
      // have multiline key

      // https://yaml.org/spec/1.2/spec.html#id2801448
      // e.g.
      // **yaml:
      // | {matches
      // | % : 20}
      // **json:
      // | { "matches %": 20 }
      return false;
    }
  }
  return true;
}

/**
 * Check if it can be converted to flow style.
 */
function canFixToFlow(mappingInfo: Stack, node: AST.YAMLBlockMapping) {
  if (mappingInfo.hasNullPair || mappingInfo.hasBlockLiteralOrFolded) {
    return false;
  }
  if (mappingInfo.hasBlockStyle) {
    // If it have a block style, it cannot auto-fix.
    return false;
  }

  for (const pair of node.pairs) {
    const value = unwrapMeta(pair.value);
    const key = unwrapMeta(pair.key);
    if (value && value.type === "YAMLScalar" && value.style === "plain") {
      if (value.loc.start.line < value.loc.end.line) {
        // have plain style multiline value
        return false;
      }
      if (/[[\]{}]/u.test(value.strValue)) {
        // have invalid char
        return false;
      }
      if (value.strValue.includes(",")) {
        // The value will change after conversion.
        return false;
      }
    }
    if (key && key.type === "YAMLScalar" && key.style === "plain") {
      if (/[[\]{]/u.test(key.strValue)) {
        // have invalid char
        return false;
      }
      if (/[,}]/u.test(key.strValue)) {
        // The value will change after conversion.
        return false;
      }
    }
  }
  return true;
}

/**
 * Build the fixer function that makes the flow style to block style.
 */
function buildFixFlowToBlock(node: AST.YAMLFlowMapping, context: RuleContext) {
  return function* (fixer: RuleFixer): IterableIterator<Fix> {
    const sourceCode = context.getSourceCode();
    const open = sourceCode.getFirstToken(node);
    const close = sourceCode.getLastToken(node);
    if (open?.value !== "{" || close?.value !== "}") {
      return;
    }
    const expectIndent = calcExpectIndentForPairs(node, context);
    if (expectIndent == null) {
      // cannot fix
      return;
    }

    const openPrevToken = sourceCode.getTokenBefore(open, {
      includeComments: true,
    });
    if (!openPrevToken) {
      yield fixer.removeRange([sourceCode.ast.range[0], open.range[1]]);
    } else if (openPrevToken.loc.end.line < open.loc.start.line) {
      yield fixer.removeRange([openPrevToken.range[1], open.range[1]]);
    } else {
      yield fixer.remove(open);
    }
    let prev: YAMLNodeOrToken = open;
    for (const pair of node.pairs) {
      const prevToken = sourceCode.getTokenBefore(pair, {
        includeComments: true,
        filter: (token) => !isComma(token),
      })!;
      yield* removeComma(prev, prevToken);
      yield fixer.replaceTextRange(
        [prevToken.range[1], pair.range[0]],
        `\n${expectIndent}`
      );
      const colonToken = sourceCode.getTokenAfter(pair.key!, isColon)!;
      if (
        colonToken.range[1] ===
        sourceCode.getTokenAfter(colonToken, {
          includeComments: true,
        })!.range[0]
      ) {
        yield fixer.insertTextAfter(colonToken, " ");
      }
      yield* processIndentFix(fixer, expectIndent, pair.value!, context);
      prev = pair;
    }
    yield* removeComma(prev, close);
    yield fixer.remove(close);

    /**
     * Remove between commas
     */
    function* removeComma(a: YAMLNodeOrToken, b: YAMLNodeOrToken) {
      for (const token of sourceCode.getTokensBetween(a, b, {
        includeComments: true,
      })) {
        if (isComma(token)) {
          yield fixer.remove(token);
        }
      }
    }
  };
}

/**
 * Build the fixer function that makes the block style to flow style.
 */
function buildFixBlockToFlow(
  node: AST.YAMLBlockMapping,
  _context: RuleContext
) {
  return function* (fixer: RuleFixer): IterableIterator<Fix> {
    yield fixer.insertTextBefore(node, "{");
    const pairs = [...node.pairs];
    const lastPair = pairs.pop()!;
    for (const pair of pairs) {
      yield fixer.insertTextAfter(pair, ",");
    }

    yield fixer.insertTextAfter(lastPair || node, "}");
  };
}
