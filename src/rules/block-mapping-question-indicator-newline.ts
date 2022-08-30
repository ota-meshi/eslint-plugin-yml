import { createRule } from "../utils";
import { isQuestion } from "../utils/ast-utils";

export default createRule("block-mapping-question-indicator-newline", {
  meta: {
    docs: {
      description: "enforce consistent line breaks after `?` indicator",
      categories: ["standard"],
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
        "Unexpected line break after this `?` indicator.",
      expectedLinebreakAfterIndicator:
        "Expected a line break after this `?` indicator.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    if (!context.parserServices.isYAML) {
      return {};
    }
    const option: "never" | "always" = context.options[0] || "never";

    return {
      YAMLMapping(node) {
        if (node.style !== "block") {
          return;
        }
        for (const pair of node.pairs) {
          const key = pair.key;
          if (!key) {
            continue;
          }
          const question = sourceCode.getFirstToken(pair);
          if (!question || !isQuestion(question)) {
            continue;
          }

          const hasNewline = question.loc.end.line < key.loc.start.line;
          if (hasNewline) {
            if (option === "never") {
              context.report({
                loc: question.loc,
                messageId: "unexpectedLinebreakAfterIndicator",
                fix(fixer) {
                  const spaces = " ".repeat(
                    Math.max(key.loc.start.column - question.loc.end.column, 1)
                  );
                  return fixer.replaceTextRange(
                    [question.range[1], key.range[0]],
                    spaces
                  );
                },
              });
            }
          } else {
            if (option === "always") {
              context.report({
                loc: question.loc,
                messageId: "expectedLinebreakAfterIndicator",
                fix(fixer) {
                  const spaces = `\n${" ".repeat(key.loc.start.column)}`;
                  return fixer.replaceTextRange(
                    [question.range[1], key.range[0]],
                    spaces
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
