import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index";
import {
  hasTabIndent,
  calcExpectIndentForEntries,
  isKeyNode,
  getActualIndent,
  getActualIndentFromLine,
  compareIndent,
  unwrapMeta,
  processIndentFix,
  fixIndent,
} from "../utils/yaml";
import type {
  RuleContext,
  Fix,
  RuleFixer,
  YAMLNodeOrToken,
  SourceCode,
} from "../types";
import { isComma } from "../utils/ast-utils";
import { getSourceCode } from "../utils/compat";

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

type Option = "always" | "never" | "ignore";
const OPTIONS_ENUM: Option[] = ["always", "never", "ignore"];

/**
 * Parse options
 */
function parseOptions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- option
  option: any,
): {
  singleline: Option;
  multiline: Option;
} {
  const opt: {
    singleline: Option;
    multiline: Option;
  } = {
    singleline: "ignore",
    multiline: "always",
  };

  if (option) {
    if (typeof option === "string") {
      opt.singleline = option as Option;
      opt.multiline = option as Option;
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

export default createRule("block-sequence", {
  meta: {
    docs: {
      description: "require or disallow block style sequences.",
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
      required: "Must use block style sequences.",
      disallow: "Must use flow style sequences.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices?.isYAML) {
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
      YAMLMapping: downStack,
      YAMLSequence: downStack,
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
      "YAMLMapping:exit": upStack,
      "YAMLSequence:exit"(node) {
        const sequenceInfo = styleStack!;
        upStack();
        if (node.entries.length === 0) {
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
            // e.g. [1]: value
            return;
          }

          const canFix =
            canFixToBlock(sequenceInfo, node, sourceCode) &&
            !hasTabIndent(context);
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
            canFixToFlow(sequenceInfo, node, context) && !hasTabIndent(context);
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
function canFixToBlock(
  sequenceInfo: Stack,
  node: AST.YAMLFlowSequence,
  sourceCode: SourceCode,
) {
  if (sequenceInfo.hasNullPair || sequenceInfo.hasBlockLiteralOrFolded) {
    return false;
  }
  if (sequenceInfo.withinFlowStyle) {
    // It cannot be auto-fixed unless it is a top-level flow style.
    return false;
  }
  for (const entry of node.entries) {
    if (entry.type === "YAMLMapping" && entry.style === "block") {
      for (const pair of entry.pairs) {
        if (pair.key) {
          if (pair.key.loc.start.line < pair.key.loc.end.line) {
            // have multiline key entry
            return false;
          }
          if (pair.key.type === "YAMLMapping") {
            // [ {json:foo}: bar ]
            return false;
          }
        }
        if (pair.value) {
          const colon = sourceCode.getTokenBefore(pair.value);
          if (colon?.value === ":") {
            if (colon.range[1] === pair.value.range[0]) {
              // There is no space between colon and value.
              return false;
            }
          }
        }
      }
    }
  }
  return true;
}

/**
 * Check if it can be converted to flow style.
 */
function canFixToFlow(
  sequenceInfo: Stack,
  node: AST.YAMLBlockSequence,
  context: RuleContext,
) {
  if (sequenceInfo.hasNullPair || sequenceInfo.hasBlockLiteralOrFolded) {
    return false;
  }
  if (sequenceInfo.hasBlockStyle) {
    // If it have a block style, it cannot auto-fix.
    return false;
  }
  if (node.parent.type === "YAMLWithMeta") {
    // has anchor or tag
    const metaIndent = getActualIndent(node.parent, context);
    if (metaIndent != null) {
      for (let line = node.loc.start.line; line <= node.loc.end.line; line++) {
        if (
          compareIndent(metaIndent, getActualIndentFromLine(line, context)) > 0
        ) {
          // If the indent is less than anchor or tag, it cannot be fix.
          return false;
        }
      }
    }
  }
  for (const entry of node.entries) {
    const value = unwrapMeta(entry);
    if (value && value.type === "YAMLScalar" && value.style === "plain") {
      if (value.strValue.includes(",")) {
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
function buildFixFlowToBlock(node: AST.YAMLFlowSequence, context: RuleContext) {
  return function* (fixer: RuleFixer): IterableIterator<Fix> {
    const sourceCode = getSourceCode(context);
    const open = sourceCode.getFirstToken(node);
    const close = sourceCode.getLastToken(node);
    if (open?.value !== "[" || close?.value !== "]") {
      return;
    }
    const expectIndent = calcExpectIndentForEntries(node, context);
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
    for (const entry of node.entries) {
      const prevToken = sourceCode.getTokenBefore(entry, {
        includeComments: true,
        filter: (token) => !isComma(token),
      })!;
      yield* removeComma(prev, prevToken);
      yield fixer.replaceTextRange(
        [prevToken.range[1], entry.range[0]],
        `\n${expectIndent}- `,
      );
      yield* processEntryIndent(`${expectIndent}  `, entry);

      prev = entry;
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

    /**
     * Indent
     */
    function* processEntryIndent(
      baseIndent: string,
      entry: AST.YAMLContent | AST.YAMLWithMeta,
    ) {
      if (entry.type === "YAMLWithMeta" && entry.value) {
        yield* processIndentFix(fixer, baseIndent, entry.value, context);
      } else if (entry.type === "YAMLMapping") {
        for (const p of entry.pairs) {
          if (p.range[0] === entry.range[0]) {
            if (p.value) {
              yield* processIndentFix(fixer, baseIndent, p.value, context);
            }
          } else {
            yield* processIndentFix(fixer, baseIndent, p, context);
          }
        }
        if (entry.style === "flow") {
          const close = sourceCode.getLastToken(entry);
          if (close.value === "}") {
            const actualIndent = getActualIndent(close, context);
            if (
              actualIndent != null &&
              compareIndent(actualIndent, baseIndent) < 0
            ) {
              yield fixIndent(fixer, sourceCode, baseIndent, close);
            }
          }
        }
      } else if (entry.type === "YAMLSequence") {
        for (const e of entry.entries) {
          if (!e) {
            // Cannot cover because entry is YAMLFlowSequence
            continue;
          }
          yield* processIndentFix(fixer, baseIndent, e, context);
        }
      }
    }
  };
}

/**
 * Build the fixer function that makes the block style to flow style.
 */
function buildFixBlockToFlow(
  node: AST.YAMLBlockSequence,
  context: RuleContext,
) {
  const sourceCode = getSourceCode(context);
  return function* (fixer: RuleFixer): IterableIterator<Fix> {
    const entries = node.entries.filter(
      (
        e: AST.YAMLContent | AST.YAMLWithMeta | null,
      ): e is AST.YAMLContent | AST.YAMLWithMeta => e != null,
    );
    if (entries.length !== node.entries.length) {
      // cannot convert
      return;
    }
    const firstEntry = entries.shift()!;
    const lastEntry = entries.pop();

    const firstHyphen = sourceCode.getTokenBefore(firstEntry);
    yield fixer.replaceText(firstHyphen!, " ");
    yield fixer.insertTextBefore(firstEntry, "[");
    if (lastEntry) {
      yield fixer.insertTextAfter(firstEntry, ",");
    }

    for (const entry of entries) {
      const hyphen = sourceCode.getTokenBefore(entry);
      yield fixer.replaceText(hyphen!, " ");
      yield fixer.insertTextAfter(entry, ",");
    }

    if (lastEntry) {
      const lastHyphen = sourceCode.getTokenBefore(lastEntry);
      yield fixer.replaceText(lastHyphen!, " ");
    }
    yield fixer.insertTextAfter(lastEntry || firstEntry || node, "]");
  };
}
