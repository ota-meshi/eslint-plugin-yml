import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils";

export default createRule("no-trailing-zeros", {
  meta: {
    docs: {
      description: "disallow trailing zeros for floats",
      categories: null,
      extensionRule: false,
      layout: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      wrongZeros: "Trailing zeros are not allowed, fix to `{{fixed}}`.",
    },
    type: "layout",
  },
  create(context) {
    if (!context.parserServices.isYAML) {
      return {};
    }

    return {
      YAMLScalar(node: AST.YAMLScalar) {
        if (node.style !== "plain") {
          return;
        } else if (typeof node.value !== "number") {
          return;
        } else if (!node.strValue.endsWith("0")) {
          return;
        }

        const parts = node.strValue.split(".");
        if (parts.length !== 2) {
          return;
        }

        while (parts[1].endsWith("0")) {
          parts[1] = parts[1].slice(0, -1);
        }
        const fixed = parts[1] ? parts.join(".") : parts[0] || "0";

        context.report({
          node,
          messageId: "wrongZeros",
          data: {
            fixed,
          },
          fix(fixer) {
            return fixer.replaceText(node, fixed);
          },
        });
      },
    };
  },
});
