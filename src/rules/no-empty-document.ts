import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index.js";
import { getSourceCode } from "../utils/compat.js";

export default createRule("no-empty-document", {
  meta: {
    docs: {
      description: "disallow empty document",
      categories: ["recommended", "standard"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpectedEmpty: "Empty documents are forbidden.",
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
      YAMLDocument(node) {
        if (isEmptyNode(node.content)) {
          context.report({
            node,
            messageId: "unexpectedEmpty",
          });
        }
      },
    };
  },
});
