/**
 * Copy from https://github.com/eslint/eslint/blob/master/lib/linter/source-code-fixer.js
 *
 * @author Nicholas C. Zakas
 * @copyright MIT (https://github.com/eslint/eslint/blob/master/LICENSE)
 */

import type { Linter } from "eslint";

const BOM = "\uFEFF";

function compareMessagesByFixRange(a: any, b: any) {
  return a.fix.range[0] - b.fix.range[0] || a.fix.range[1] - b.fix.range[1];
}

function compareMessagesByLocation(a: any, b: any) {
  return a.line - b.line || a.column - b.column;
}

/**
 * Applies the fixes specified by the messages to the given text. Tries to be
 * smart about the fixes and won't apply fixes over the same area in the text.
 * @param {string} sourceText The text to apply the changes to.
 * @param {Message[]} messages The array of messages reported by ESLint.
 * @param {boolean|Function} [shouldFix=true] Determines whether each message should be fixed
 * @returns {Object} An object containing the fixed text and any unfixed messages.
 */
export function applyFixes(
  sourceText: string,
  messages: Linter.LintMessage[]
): {
  fixed: boolean;
  messages: Linter.LintMessage[];
  output: string;
} {
  // clone the array
  const remainingMessages: Linter.LintMessage[] = [];
  const fixes: Linter.LintMessage[] = [];
  const bom = sourceText.startsWith(BOM) ? BOM : "";
  const text = bom ? sourceText.slice(1) : sourceText;
  let lastPos = Number.NEGATIVE_INFINITY;
  let output = bom;

  /**
   * Try to use the 'fix' from a problem.
   * @param   {Message} problem The message object to apply fixes from
   * @returns {boolean}         Whether fix was successfully applied
   */
  function attemptFix(problem: Linter.LintMessage) {
    const fix = problem.fix!;
    const start = fix.range[0];
    const end = fix.range[1];

    // Remain it as a problem if it's overlapped or it's a negative range
    if (lastPos >= start || start > end) {
      remainingMessages.push(problem);
      return false;
    }

    // Remove BOM.
    if ((start < 0 && end >= 0) || (start === 0 && fix.text.startsWith(BOM))) {
      output = "";
    }

    // Make output to this fix.
    output += text.slice(Math.max(0, lastPos), Math.max(0, start));
    output += fix.text;
    lastPos = end;
    return true;
  }

  messages.forEach((problem) => {
    if (Object.prototype.hasOwnProperty.call(problem, "fix")) {
      fixes.push(problem);
    } else {
      remainingMessages.push(problem);
    }
  });

  if (fixes.length) {
    for (const problem of fixes.sort(compareMessagesByFixRange)) {
      attemptFix(problem);
    }
    output += text.slice(Math.max(0, lastPos));

    return {
      fixed: true,
      messages: remainingMessages.sort(compareMessagesByLocation),
      output,
    };
  }

  return {
    fixed: false,
    messages,
    output: bom + text,
  };
}
