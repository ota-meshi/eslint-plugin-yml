import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index.js";

export default createRule("no-trailing-zeros", {
  meta: {
    docs: {
      description: "disallow trailing zeros for floats",
      categories: ["standard"],
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
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    return {
      YAMLScalar(node: AST.YAMLScalar) {
        if (node.style !== "plain") {
          return;
        } else if (typeof node.value !== "number") {
          return;
        }

        const floating = parseFloatingPoint(node.strValue);
        if (!floating) {
          return;
        }
        let { decimalPart } = floating;
        while (decimalPart.endsWith("_")) {
          decimalPart = decimalPart.slice(0, -1);
        }
        if (!decimalPart.endsWith("0")) {
          return;
        }
        while (decimalPart.endsWith("0")) {
          decimalPart = decimalPart.slice(0, -1);
          while (decimalPart.endsWith("_")) {
            decimalPart = decimalPart.slice(0, -1);
          }
        }
        const fixed = decimalPart
          ? `${floating.sign}${floating.intPart}.${decimalPart}${floating.expPart}`
          : `${floating.sign}${floating.intPart || "0"}${floating.expPart}`;

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

/** Parse floating point number string */
function parseFloatingPoint(str: string) {
  const parts = str.split(".");
  if (parts.length !== 2) {
    // No floating point present.
    return null;
  }
  let decimalPart: string, expPart: string, intPart: string, sign: string;
  const expIndex = parts[1].search(/e/iu);
  if (expIndex >= 0) {
    decimalPart = parts[1].slice(0, expIndex);
    expPart = parts[1].slice(expIndex);
  } else {
    decimalPart = parts[1];
    expPart = "";
  }
  if (parts[0].startsWith("-") || parts[0].startsWith("+")) {
    sign = parts[0][0];
    intPart = parts[0].slice(1);
  } else {
    sign = "";
    intPart = parts[0];
  }

  return {
    sign,
    intPart,
    decimalPart,
    expPart,
  };
}
