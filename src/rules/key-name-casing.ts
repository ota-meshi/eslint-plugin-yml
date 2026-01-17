import type { AST } from "yaml-eslint-parser";
import { getStaticYAMLValue } from "yaml-eslint-parser";
import { createRule } from "../utils/index.js";
import type { CasingKind } from "../utils/casing.js";
import { getChecker } from "../utils/casing.js";
import { allowedCaseOptions } from "../utils/casing.js";
import { getSourceCode } from "../utils/compat.js";

type Option = {
  [key in CasingKind]?: boolean;
} & {
  ignores?: string[];
};

export default createRule("key-name-casing", {
  meta: {
    docs: {
      description: "enforce naming convention to key names",
      categories: null,
      extensionRule: false,
      layout: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          camelCase: {
            type: "boolean",
            default: true,
          },
          PascalCase: {
            type: "boolean",
            default: false,
          },
          SCREAMING_SNAKE_CASE: {
            type: "boolean",
            default: false,
          },
          "kebab-case": {
            type: "boolean",
            default: false,
          },
          snake_case: {
            type: "boolean",
            default: false,
          },
          ignores: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
            additionalItems: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      doesNotMatchFormat:
        "Key name `{{name}}` must match one of the following formats: {{formats}}",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }
    const option: Option = { ...context.options[0] };
    if (option.camelCase !== false) {
      option.camelCase = true;
    }
    const ignores = option.ignores
      ? option.ignores.map((ignore) => new RegExp(ignore))
      : [];
    const formats = Object.keys(option)
      .filter((key): key is CasingKind =>
        allowedCaseOptions.includes(key as CasingKind),
      )
      .filter((key) => option[key]);

    const checkers: ((str: string) => boolean)[] = formats.map(getChecker);

    /**
     * Check whether a given name is a valid.
     */
    function isValid(name: string): boolean {
      if (ignores.some((regex) => regex.test(name))) {
        return true;
      }
      return checkers.length ? checkers.some((c) => c(name)) : true;
    }

    return {
      YAMLPair(node: AST.YAMLPair) {
        if (!node.key) {
          return;
        }
        const name = String(getStaticYAMLValue(node.key));
        if (!isValid(name)) {
          context.report({
            loc: node.key.loc,
            messageId: "doesNotMatchFormat",
            data: {
              name,
              formats: formats.join(", "),
            },
          });
        }
      },
    };
  },
});
