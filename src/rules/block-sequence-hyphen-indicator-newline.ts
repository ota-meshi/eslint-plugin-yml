import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index";
import { isHyphen } from "../utils/ast-utils";
import { getSourceCode } from "../utils/compat";

export default createRule("block-sequence-hyphen-indicator-newline", {
  meta: {
    docs: {
      description: "enforce consistent line breaks after `-` indicator",
      categories: ["standard"],
      extensionRule: false,
      layout: true,
    },
    fixable: "whitespace",
    schema: [
      { enum: ["always", "never"] },
      {
        type: "object",
        properties: {
          nestedHyphen: { enum: ["always", "never"] },
          blockMapping: { enum: ["always", "never"] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedLinebreakAfterIndicator:
        "Unexpected line break after this `-` indicator.",
      expectedLinebreakAfterIndicator:
        "Expected a line break after this `-` indicator.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }
    const style: "never" | "always" = context.options[0] || "never";
    const nestedHyphenStyle: "never" | "always" =
      context.options[1]?.nestedHyphen || "always";
    const blockMappingStyle: "never" | "always" =
      context.options[1]?.blockMapping || style;

    /**
     * Get style from given hyphen
     */
    function getStyleOption(
      hyphen: AST.Token,
      entry: AST.YAMLContent | AST.YAMLWithMeta,
    ): "never" | "always" {
      const next = sourceCode.getTokenAfter(hyphen);
      if (next && isHyphen(next)) {
        return nestedHyphenStyle;
      }

      if (entry.type === "YAMLMapping" && entry.style === "block") {
        return blockMappingStyle;
      }

      return style;
    }

    return {
      YAMLSequence(node) {
        if (node.style !== "block") {
          return;
        }
        for (const entry of node.entries) {
          if (!entry) {
            continue;
          }
          const hyphen = sourceCode.getTokenBefore(entry);
          if (!hyphen) {
            continue;
          }

          const hasNewline = hyphen.loc.end.line < entry.loc.start.line;
          if (hasNewline) {
            if (getStyleOption(hyphen, entry) === "never") {
              context.report({
                loc: hyphen.loc,
                messageId: "unexpectedLinebreakAfterIndicator",
                fix(fixer) {
                  const spaceCount =
                    entry.loc.start.column - hyphen.loc.end.column;
                  if (
                    spaceCount < 1 &&
                    entry.loc.start.line < entry.loc.end.line
                  ) {
                    // Stop auto-fix as it can break the indentation of multi-line entry.
                    return null;
                  }
                  const spaces = " ".repeat(Math.max(spaceCount, 1));
                  return fixer.replaceTextRange(
                    [hyphen.range[1], entry.range[0]],
                    spaces,
                  );
                },
              });
            }
          } else {
            if (getStyleOption(hyphen, entry) === "always") {
              context.report({
                loc: hyphen.loc,
                messageId: "expectedLinebreakAfterIndicator",
                fix(fixer) {
                  const spaces = `\n${" ".repeat(entry.loc.start.column)}`;
                  return fixer.replaceTextRange(
                    [hyphen.range[1], entry.range[0]],
                    spaces,
                  );
                },
              });
            }
          }
        }
      },
    };
  },
});
