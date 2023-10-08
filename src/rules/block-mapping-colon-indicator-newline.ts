import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils";
import { isColon } from "../utils/ast-utils";
import { getSourceCode } from "../utils/compat";

export default createRule("block-mapping-colon-indicator-newline", {
  meta: {
    docs: {
      description: "enforce consistent line breaks after `:` indicator",
      categories: [
        // TODO Switch to "standard" in the major version.
        // "standard"
      ],
      extensionRule: false,
      layout: true,
    },
    fixable: "whitespace",
    schema: [
      {
        enum: ["always", "never"],
      },
    ],
    messages: {
      unexpectedLinebreakAfterIndicator:
        "Unexpected line break after this `:` indicator.",
      expectedLinebreakAfterIndicator:
        "Expected a line break after this `:` indicator.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isYAML) {
      return {};
    }
    const option: "never" | "always" = context.options[0] || "never";

    /**
     * Get the colon token from the given pair node.
     */
    function getColonToken(pair: AST.YAMLPair) {
      const limitIndex = pair.key ? pair.key.range[1] : pair.range[0];
      let candidateColon = sourceCode.getTokenBefore(pair.value!);
      while (candidateColon && !isColon(candidateColon)) {
        candidateColon = sourceCode.getTokenBefore(candidateColon);
        if (candidateColon && candidateColon.range[1] <= limitIndex) {
          // The colon is not in the mapping.
          return null;
        }
      }
      if (!candidateColon || !isColon(candidateColon)) {
        return null;
      }
      return candidateColon;
    }

    /**
     * Checks whether the newline between the given value node and the colon can be removed.
     */
    function canRemoveNewline(value: AST.YAMLContent | AST.YAMLWithMeta) {
      const node = value.type === "YAMLWithMeta" ? value.value : value;

      if (
        node &&
        (node.type === "YAMLSequence" || node.type === "YAMLMapping") &&
        node.style === "block"
      ) {
        return false;
      }
      return true;
    }

    return {
      YAMLMapping(node) {
        if (node.style !== "block") {
          return;
        }
        for (const pair of node.pairs) {
          const value = pair.value;
          if (!value) {
            continue;
          }
          const colon = getColonToken(pair);
          if (!colon) {
            return;
          }

          const hasNewline = colon.loc.end.line < value.loc.start.line;
          if (hasNewline) {
            if (option === "never") {
              if (!canRemoveNewline(value)) {
                return;
              }
              context.report({
                loc: colon.loc,
                messageId: "unexpectedLinebreakAfterIndicator",
                fix(fixer) {
                  const spaceCount =
                    value.loc.start.column - colon.loc.end.column;
                  if (
                    spaceCount < 1 &&
                    value.loc.start.line < value.loc.end.line
                  ) {
                    // Stop auto-fix as it can break the indentation of multi-line value.
                    return null;
                  }
                  const spaces = " ".repeat(Math.max(spaceCount, 1));
                  return fixer.replaceTextRange(
                    [colon.range[1], value.range[0]],
                    spaces,
                  );
                },
              });
            }
          } else {
            if (option === "always") {
              context.report({
                loc: colon.loc,
                messageId: "expectedLinebreakAfterIndicator",
                fix(fixer) {
                  const spaces = `\n${" ".repeat(value.loc.start.column)}`;
                  return fixer.replaceTextRange(
                    [colon.range[1], value.range[0]],
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
