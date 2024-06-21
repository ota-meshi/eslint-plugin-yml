import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index";
import { isHyphen } from "../utils/ast-utils";
import { getSourceCode } from "../utils/compat";

export default createRule("no-empty-sequence-entry", {
  meta: {
    docs: {
      description: "disallow empty sequence entries",
      categories: ["recommended", "standard"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpectedEmpty: "Empty sequence entries are forbidden.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isYAML) {
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
      YAMLSequence(node: AST.YAMLSequence) {
        if (node.style !== "block") {
          return;
        }
        node.entries.forEach((entry, index) => {
          if (isEmptyNode(entry)) {
            context.report({
              node: getHyphen(node, index) || node,
              messageId: "unexpectedEmpty",
            });
          }
        });
      },
    };

    /**
     * Get hyphen token from given entry index
     */
    function getHyphen(
      node: AST.YAMLBlockSequence,
      index: number,
    ): AST.Token | null {
      if (index === 0) {
        const token = sourceCode.getFirstToken(node);
        return isHyphen(token) ? token : null;
      }
      const prev = node.entries[index - 1];
      if (prev) {
        const token = sourceCode.getTokenAfter(prev);
        return isHyphen(token) ? token : null;
      }
      const prevHyphen = getHyphen(node, index - 1);
      if (prevHyphen) {
        const token = sourceCode.getTokenAfter(prevHyphen);
        return isHyphen(token) ? token : null;
      }
      return null;
    }
  },
});
