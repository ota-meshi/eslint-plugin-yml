import path from "path";
import { createRule } from "../utils/index.js";

export default createRule("file-extension", {
  meta: {
    docs: {
      description: "enforce YAML file extension",
      categories: [],
      extensionRule: false,
      layout: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          extension: {
            enum: ["yaml", "yml"],
          },
          caseSensitive: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpected: `Expected extension '{{expected}}' but used extension '{{actual}}'.`,
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }
    const expected: string = context.options[0]?.extension || "yaml";
    const caseSensitive: string = context.options[0]?.caseSensitive ?? true;

    return {
      Program(node) {
        const filename = context.filename;
        const actual = path.extname(filename);
        if (
          (caseSensitive ? actual : actual.toLocaleLowerCase()) ===
          `.${expected}`
        ) {
          return;
        }
        context.report({
          node,
          loc: node.loc.start,
          messageId: "unexpected",
          data: {
            expected: `.${expected}`,
            actual,
          },
        });
      },
    };
  },
});
