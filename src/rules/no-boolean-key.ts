import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index.js";

export default createRule("no-boolean-key", {
  meta: {
    docs: {
      description: "disallow boolean mapping keys",
      categories: null,
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpectedBoolean: "Boolean mapping keys are not allowed in YAML 1.1.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    let currentDocument: AST.YAMLDocument | undefined;
    let anchors: Record<string, AST.YAMLAnchor[]> = {};

    /**
     * Find the closest preceding anchor for the given alias.
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
     * Check whether the given node resolves to a boolean.
     */
    function isBooleanNode(
      node: AST.YAMLContent | AST.YAMLWithMeta | null,
    ): boolean {
      if (!node) {
        return false;
      }
      if (node.type === "YAMLWithMeta") {
        if (node.tag) {
          return node.tag.tag === "tag:yaml.org,2002:bool";
        }
        return isBooleanNode(node.value);
      }
      if (node.type === "YAMLAlias") {
        const anchor = findAnchor(node);
        if (!anchor) {
          return false;
        }
        return isBooleanNode(anchor.parent);
      }
      if (node.type !== "YAMLScalar") {
        return false;
      }

      return typeof node.value === "boolean";
    }

    return {
      YAMLDocument(node) {
        currentDocument = node;
        anchors = {};
      },
      YAMLAnchor(node: AST.YAMLAnchor) {
        const list = anchors[node.name] || (anchors[node.name] = []);
        list.push(node);
      },
      YAMLPair(node) {
        if (currentDocument?.version === "1.1" && isBooleanNode(node.key)) {
          context.report({
            node: node.key || node,
            messageId: "unexpectedBoolean",
          });
        }
      },
    };
  },
});
