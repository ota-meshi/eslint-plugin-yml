import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils";

export default createRule("require-string-key", {
  meta: {
    docs: {
      description: "disallow mapping keys other than strings",
      categories: null,
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      expectedString: "The key must be a string.",
    },
    type: "suggestion",
  },
  create(context) {
    if (!context.parserServices.isYAML) {
      return {};
    }

    let anchors: Record<string, AST.YAMLAnchor[]> = {};

    /**
     * Find Anchor
     */
    function findAnchor(alias: AST.YAMLAlias) {
      const target: {
        anchor: null | AST.YAMLAnchor;
        distance: number;
      } = {
        anchor: null,
        distance: Infinity,
      };
      for (const anchor of anchors[alias.name] || []) {
        if (anchor.range[0] < alias.range[0]) {
          const distance = alias.range[0] - anchor.range[0];
          if (target.distance >= distance) {
            target.anchor = anchor;
            target.distance = distance;
          }
        }
      }
      return target.anchor;
    }

    /**
     * Checks if the given node is string
     */
    function isStringNode(
      node: AST.YAMLContent | AST.YAMLWithMeta | null
    ): boolean {
      if (!node) {
        return false;
      }
      if (node.type === "YAMLWithMeta") {
        if (node.tag && node.tag.tag === "tag:yaml.org,2002:str") {
          return true;
        }
        return isStringNode(node.value);
      }
      if (node.type === "YAMLAlias") {
        const anchor = findAnchor(node);
        if (!anchor) {
          return false;
        }
        return isStringNode(anchor.parent);
      }
      if (node.type !== "YAMLScalar") {
        return false;
      }

      return typeof node.value === "string";
    }

    return {
      YAMLDocument() {
        anchors = {};
      },
      YAMLAnchor(node: AST.YAMLAnchor) {
        const list = anchors[node.name] || (anchors[node.name] = []);
        list.push(node);
      },
      YAMLPair(node) {
        if (!isStringNode(node.key)) {
          context.report({
            node: node.key || node,
            messageId: "expectedString",
          });
        }
      },
    };
  },
});
