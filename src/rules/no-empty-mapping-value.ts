import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index";
import { getSourceCode } from "../utils/compat";

export default createRule("no-empty-mapping-value", {
  meta: {
    docs: {
      description: "disallow empty mapping values",
      categories: ["recommended", "standard"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpectedEmpty: "Empty mapping values are forbidden.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    /**
     * Checks if the given node is empty
     */
    function isEmptyNode(
      node: AST.YAMLContent | AST.YAMLWithMeta | null,
    ): boolean {
      if (!node) {
        return true;
      }
      if (node.type === "YAMLWithMeta") {
        return isEmptyNode(node.value);
      }

      return false;
    }

    return {
      YAMLPair(node) {
        if (isEmptyNode(node.value)) {
          context.report({
            node,
            messageId: "unexpectedEmpty",
          });
        }
      },
    };
  },
});
