import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index.js";

const URL_REGEXP = /[^#/:?]:\/\/[^#?]/u;

/**
 * Compute the length of the given line, expanding tabs to the next tab stop.
 */
function computeLineLength(line: string, tabWidth: number): number {
  let extraCharacterCount = 0;
  line.replace(/\t/gu, (_, offset: number) => {
    const totalOffset = offset + extraCharacterCount;
    const spaceCount = tabWidth - (tabWidth ? totalOffset % tabWidth : 0);
    extraCharacterCount += spaceCount - 1;
    return "";
  });
  return Array.from(line).length + extraCharacterCount;
}

export default createRule("max-len", {
  meta: {
    docs: {
      description: "enforce a maximum line length",
      categories: null,
      extensionRule: "max-len",
      layout: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          code: {
            type: "integer",
            minimum: 0,
          },
          comments: {
            type: "integer",
            minimum: 0,
          },
          tabWidth: {
            type: "integer",
            minimum: 0,
          },
          ignorePattern: {
            type: "string",
          },
          ignoreComments: {
            type: "boolean",
          },
          ignoreTrailingComments: {
            type: "boolean",
          },
          ignoreUrls: {
            type: "boolean",
          },
          ignoreStrings: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      max: "This line has a length of {{lineLength}}. Maximum allowed is {{maxLength}}.",
      maxComment:
        "This line has a comment length of {{lineLength}}. Maximum allowed is {{maxCommentLength}}.",
    },
    type: "layout",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    const options = context.options[0] || {};
    const maxLength: number =
      typeof options.code === "number" ? options.code : 80;
    const tabWidth: number =
      typeof options.tabWidth === "number" ? options.tabWidth : 4;
    const maxCommentLength: number | undefined =
      typeof options.comments === "number" ? options.comments : undefined;
    const ignoreComments = Boolean(options.ignoreComments);
    const ignoreTrailingComments =
      Boolean(options.ignoreTrailingComments) || ignoreComments;
    const ignoreUrls = Boolean(options.ignoreUrls);
    const ignoreStrings = Boolean(options.ignoreStrings);
    const ignorePattern: RegExp | null = options.ignorePattern
      ? new RegExp(options.ignorePattern, "u")
      : null;

    /** Line numbers that contain part of a quoted scalar. */
    const quotedScalarLines = new Set<number>();

    /** Check whether the measured text of a line is ignored by an option. */
    function isIgnored(textToMeasure: string, lineNumber: number) {
      return (
        (ignorePattern && ignorePattern.test(textToMeasure)) ||
        (ignoreUrls && URL_REGEXP.test(textToMeasure)) ||
        (ignoreStrings && quotedScalarLines.has(lineNumber))
      );
    }

    /** Check the part of a line between `startColumn` and `endColumn`. */
    function checkLine(
      lineNumber: number,
      startColumn: number,
      endColumn: number,
      comment: AST.Comment | undefined,
    ) {
      const line = sourceCode.lines[lineNumber - 1];
      let lineIsComment = false;
      let textToMeasure = line.slice(startColumn, endColumn);

      if (comment) {
        const before = line.slice(startColumn, comment.loc.start.column);
        if (!before.trim()) {
          lineIsComment = true;
        } else if (ignoreTrailingComments) {
          textToMeasure = before.replace(/\s+$/u, "");
        }
      }

      if (
        (lineIsComment && ignoreComments) ||
        isIgnored(textToMeasure, lineNumber)
      ) {
        return;
      }

      const lineLength = computeLineLength(textToMeasure, tabWidth);
      const loc = {
        start: { line: lineNumber, column: startColumn },
        end: { line: lineNumber, column: startColumn + textToMeasure.length },
      };

      if (lineIsComment && maxCommentLength) {
        if (lineLength > maxCommentLength) {
          context.report({
            loc,
            messageId: "maxComment",
            data: {
              lineLength: String(lineLength),
              maxCommentLength: String(maxCommentLength),
            },
          });
        }
      } else if (lineLength > maxLength) {
        context.report({
          loc,
          messageId: "max",
          data: {
            lineLength: String(lineLength),
            maxLength: String(maxLength),
          },
        });
      }
    }

    return {
      YAMLScalar(node: AST.YAMLScalar) {
        if (
          ignoreStrings &&
          (node.style === "double-quoted" || node.style === "single-quoted")
        ) {
          for (
            let line = node.loc.start.line;
            line <= node.loc.end.line;
            line++
          ) {
            quotedScalarLines.add(line);
          }
        }
      },
      "Program:exit"(node: AST.YAMLProgram) {
        // YAML comments always run to the end of the line,
        // so each line has at most one comment.
        const commentsByLine = new Map<number, AST.Comment>();
        for (const comment of sourceCode.getAllComments()) {
          commentsByLine.set(comment.loc.start.line, comment);
        }

        // Only check the lines of this YAML program.
        // In a Vue custom block, `sourceCode.lines` holds the whole `.vue` file.
        const { start, end } = node.loc;
        for (
          let lineNumber = start.line;
          lineNumber <= end.line;
          lineNumber++
        ) {
          checkLine(
            lineNumber,
            lineNumber === start.line ? start.column : 0,
            lineNumber === end.line
              ? end.column
              : sourceCode.lines[lineNumber - 1].length,
            commentsByLine.get(lineNumber),
          );
        }
      },
    };
  },
});
