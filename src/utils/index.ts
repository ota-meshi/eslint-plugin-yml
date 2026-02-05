/* eslint @typescript-eslint/no-explicit-any: off -- util */
import type { RuleModule, PartialRuleModule } from "../types.js";
import type { Rule } from "eslint";
import * as yamlESLintParser from "yaml-eslint-parser";
import path from "node:path";

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(
  ruleName: string,
  rule: PartialRuleModule,
): RuleModule {
  return {
    meta: {
      ...rule.meta,
      docs: {
        ...rule.meta.docs,
        url: `https://ota-meshi.github.io/eslint-plugin-yml/rules/${ruleName}.html`,
        ruleId: `yml/${ruleName}`,
        ruleName,
      },
    },
    create(context: Rule.RuleContext): any {
      const sourceCode = context.sourceCode;
      if (
        typeof sourceCode.parserServices?.defineCustomBlocksVisitor ===
          "function" &&
        path.extname(context.filename) === ".vue"
      ) {
        return sourceCode.parserServices.defineCustomBlocksVisitor(
          context,
          yamlESLintParser,
          {
            target: ["yaml", "yml"],
            create(blockContext: Rule.RuleContext) {
              return rule.create(blockContext as any, {
                customBlock: true,
              });
            },
          },
        );
      }
      return rule.create(context as any, {
        customBlock: false,
      });
    },
  };
}
