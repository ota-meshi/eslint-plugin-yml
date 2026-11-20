import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index.js";

const BLANK_CLASS =
  "[\\t \\u00a0\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u200b\\u3000]";
const TRAILING_SPACES = new RegExp(`${BLANK_CLASS}+$`, "u");
const BLANK_LINE = new RegExp(`^${BLANK_CLASS}*$`, "u");

type SourceRange = [number, number];

/** Check whether a reported whitespace range is fully inside a known range. */
function isInRange(rangeStart: number, rangeEnd: number, range: SourceRange) {
  return range[0] <= rangeStart && rangeEnd <= range[1];
}

export default createRule("no-trailing-spaces", {
  meta: {
    docs: {
      description: "disallow trailing whitespace at the end of lines",
      categories: ["standard"],
      extensionRule: "no-trailing-spaces",
      layout: true,
    },
    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          skipBlankLines: {
            type: "boolean",
            default: false,
          },
          ignoreComments: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      trailingSpace: "Trailing spaces not allowed.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    const options = context.options[0] || {};
    const skipBlankLines = Boolean(options.skipBlankLines);
    const ignoreComments = Boolean(options.ignoreComments);
    const scalarRanges: {
      range: SourceRange;
      startLine: number;
    }[] = [];

    /** Check ranges that should not be reported or fixed. */
    function isIgnoredRange(
      lineNumber: number,
      rangeStart: number,
      rangeEnd: number,
    ) {
      if (
        ignoreComments &&
        sourceCode
          .getAllComments()
          .some((comment) => isInRange(rangeStart, rangeEnd, comment.range))
      ) {
        return true;
      }

      return scalarRanges.some(
        (scalar) =>
          lineNumber > scalar.startLine &&
          isInRange(rangeStart, rangeEnd, scalar.range),
      );
    }

    return {
      YAMLScalar(node: AST.YAMLScalar) {
        if (node.loc.start.line < node.loc.end.line) {
          scalarRanges.push({
            range: node.range,
            startLine: node.loc.start.line,
          });
        }
      },
      "Program:exit"() {
        for (
          let lineIndex = 0;
          lineIndex < sourceCode.lines.length;
          lineIndex++
        ) {
          const line = sourceCode.lines[lineIndex];
          const match = TRAILING_SPACES.exec(line);
          if (!match) {
            continue;
          }

          if (skipBlankLines && BLANK_LINE.test(line)) {
            continue;
          }

          const lineNumber = lineIndex + 1;
          const startColumn = match.index;
          const endColumn = line.length;
          const rangeStart = sourceCode.getIndexFromLoc({
            line: lineNumber,
            column: startColumn,
          });
          const rangeEnd = sourceCode.getIndexFromLoc({
            line: lineNumber,
            column: endColumn,
          });

          if (isIgnoredRange(lineNumber, rangeStart, rangeEnd)) {
            continue;
          }

          context.report({
            loc: {
              start: { line: lineNumber, column: startColumn },
              end: { line: lineNumber, column: endColumn },
            },
            messageId: "trailingSpace",
            fix(fixer) {
              return fixer.removeRange([rangeStart, rangeEnd]);
            },
          });
        }
      },
    };
  },
});
