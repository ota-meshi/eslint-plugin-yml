import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils";

export default createRule("no-trailing-zeros", {
  meta: {
    docs: {
      description: "disallow trailing zeros",
      categories: ["standard"],
      extensionRule: false,
      layout: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      wrongZeros: "Trailing zeros are not allowed, fix to `{{fixed}}`",
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
        }

        // https://github.com/stylelint/stylelint/blob/650f597806679a3d2eb57672c931b1a5e2acd0d6/lib/rules/number-no-trailing-zeros/index.js#LL67C25-L67C25
        const match = /(\d*)\.(\d{0,100}?)(0+)(?:\D|$)/.exec(node.strValue);
        // match[2] is any numbers between the decimal and our trailing zero, could be empty
        // match[3] is our trailing zero(s)
        if (match === null || match[2] === null || match[3] === null) {
          return;
        }

        const fixed = node.raw.replace(match[0], `${match[1]}.${match[2]}`);
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
