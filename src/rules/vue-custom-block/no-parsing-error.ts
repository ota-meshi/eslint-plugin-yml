import type { AST } from "yaml-eslint-parser";
import { createRule } from "../../utils/index.js";
import { getSourceCode } from "../../utils/compat.js";

export default createRule("vue-custom-block/no-parsing-error", {
  meta: {
    docs: {
      description: "disallow parsing errors in Vue custom blocks",
      categories: ["recommended", "standard"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {},
    type: "problem",
  },
  create(context, { customBlock }) {
    if (!customBlock) {
      return {};
    }

    const sourceCode = getSourceCode(context);
    // eslint-disable-next-line no-restricted-properties -- Workaround for bug in vue-eslint-parser v9.3.1
    const parserServices = context.parserServices ?? sourceCode.parserServices;
    const parseError = parserServices.parseError;
    if (parseError) {
      let loc: AST.Position | undefined = undefined;
      if ("column" in parseError && "lineNumber" in parseError) {
        loc = {
          line: parseError.lineNumber,
          column: parseError.column,
        };
      }
      return {
        Program(node) {
          context.report({
            node,
            loc,
            message: parseError.message,
          });
        },
      };
    }
    return {};
  },
});
