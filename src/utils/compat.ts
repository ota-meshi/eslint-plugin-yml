import {
  getSourceCode as getSourceCodeBase,
  getFilename as getFilenameBase,
} from "eslint-compat-utils";
import type { RuleContext, SourceCode } from "../types";
import type { Rule, SourceCode as ESLintSourceCode } from "eslint";

export function getSourceCode(context: RuleContext): SourceCode;
export function getSourceCode(context: Rule.RuleContext): ESLintSourceCode;
/**
 * Returns an extended instance of `context.sourceCode` or the result of `context.getSourceCode()`.
 * Extended instances can use new APIs such as `getScope(node)` even with old ESLint.
 */
export function getSourceCode(
  context: RuleContext | Rule.RuleContext,
): SourceCode | ESLintSourceCode {
  return getSourceCodeBase(context as never) as never;
}

/**
 * Gets the value of `context.filename`, but for older ESLint it returns the result of `context.getFilename()`.
 */
export function getFilename(context: RuleContext | Rule.RuleContext): string {
  return getFilenameBase(context as never);
}
