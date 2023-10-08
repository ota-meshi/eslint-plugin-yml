import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils";
import { getSourceCode } from "../utils/compat";

type Prefer = "double" | "single";

export default createRule("quotes", {
  meta: {
    docs: {
      description:
        "enforce the consistent use of either double, or single quotes",
      categories: ["standard"],
      extensionRule: false,
      layout: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          prefer: { enum: ["double", "single"] },
          avoidEscape: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongQuotes: "Strings must use {{description}}.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isYAML) {
      return {};
    }
    const objectOption = context.options[0] || {};
    const prefer: Prefer = objectOption.prefer || "double";
    const avoidEscape: boolean = objectOption.avoidEscape !== false;

    return {
      YAMLScalar(node: AST.YAMLScalar) {
        let description: string;
        if (node.style === "double-quoted" && prefer === "single") {
          if (avoidEscape && node.strValue.includes("'")) {
            return;
          }
          let preChar = "";
          for (const char of node.raw) {
            if (preChar === "\\") {
              if (char === "\\" || char === '"') {
                preChar = "";
                continue;
              }
              // cannot convert escape
              return;
            }
            preChar = char;
          }
          description = "singlequote";
        } else if (node.style === "single-quoted" && prefer === "double") {
          if (
            avoidEscape &&
            (node.strValue.includes('"') || node.strValue.includes("\\"))
          ) {
            return;
          }
          description = "doublequote";
        } else {
          return;
        }

        context.report({
          node,
          messageId: "wrongQuotes",
          data: {
            description,
          },
          fix(fixer) {
            const text = node.raw.slice(1, -1);
            if (prefer === "double") {
              return fixer.replaceText(
                node,
                `"${text
                  .replace(/''/gu, "'")
                  // escapes
                  .replace(/(["\\])/gu, "\\$1")}"`,
              );
            }
            return fixer.replaceText(
              node,
              `'${text
                .replace(/\\(["\\])/gu, "$1")
                // escapes
                .replace(/'/gu, "''")}'`,
            );
          },
        });
      },
    };
  },
});
