import type { AST } from "yaml-eslint-parser";
import escapeStringRegexp from "escape-string-regexp";
import { createRule } from "../utils/index";
import { getSourceCode } from "../utils/compat";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Escapes the control characters of a given string.
 * @param {string} s A string to escape.
 * @returns {string} An escaped string.
 */
function escapeText(s: string) {
  return `(?:${escapeStringRegexp(s)})`;
}

/**
 * Escapes the control characters of a given string.
 * And adds a repeat flag.
 * @param {string} s A string to escape.
 * @returns {string} An escaped string.
 */
function escapeAndRepeat(s: string) {
  return `${escapeText(s)}+`;
}

/**
 * Creates string pattern for exceptions.
 * Generated pattern:
 *
 * 1. A space or an exception pattern sequence.
 * @param {string[]} exceptions An exception pattern list.
 * @returns {string} A regular expression string for exceptions.
 */
function createExceptionsPattern(exceptions: string[]) {
  let pattern = "";

  // A space or an exception pattern sequence.
  // []                 ==> "\s"
  // ["-"]              ==> "(?:\s|\-+$)"
  // ["-", "="]         ==> "(?:\s|(?:\-+|=+)$)"
  // ["-", "=", "--=="] ==> "(?:\s|(?:\-+|=+|(?:\-\-==)+)$)" ==> https://jex.im/regulex/#!embed=false&flags=&re=(%3F%3A%5Cs%7C(%3F%3A%5C-%2B%7C%3D%2B%7C(%3F%3A%5C-%5C-%3D%3D)%2B)%24)
  if (exceptions.length === 0) {
    // a space.
    pattern += "\\s";
  } else {
    // a space or...
    pattern += "(?:\\s|";

    if (exceptions.length === 1) {
      // a sequence of the exception pattern.
      pattern += escapeAndRepeat(exceptions[0]);
    } else {
      // a sequence of one of the exception patterns.
      pattern += "(?:";
      pattern += exceptions.map(escapeAndRepeat).join("|");
      pattern += ")";
    }
    pattern += "$)";
  }

  return pattern;
}

/**
 * Creates RegExp object for `always` mode.
 * Generated pattern for beginning of comment:
 *
 * 1. First, a marker or nothing.
 * 2. Next, a space or an exception pattern sequence.
 * @param {string[]} markers A marker list.
 * @param {string[]} exceptions An exception pattern list.
 * @returns {RegExp} A RegExp object for the beginning of a comment in `always` mode.
 */
function createAlwaysStylePattern(markers: string[], exceptions: string[]) {
  let pattern = "^";

  // A marker or nothing.
  // ["*"]            ==> "\*?"
  // ["*", "!"]       ==> "(?:\*|!)?"
  // ["*", "/", "!<"] ==> "(?:\*|\/|(?:!<))?" ==> https://jex.im/regulex/#!embed=false&flags=&re=(%3F%3A%5C*%7C%5C%2F%7C(%3F%3A!%3C))%3F
  if (markers.length === 1) {
    // the marker.
    pattern += escapeText(markers[0]);
  } else {
    // one of markers.
    pattern += "(?:";
    pattern += markers.map(escapeText).join("|");
    pattern += ")";
  }

  pattern += "?"; // or nothing.
  pattern += createExceptionsPattern(exceptions);

  return new RegExp(pattern, "u");
}

/**
 * Creates RegExp object for `never` mode.
 * Generated pattern for beginning of comment:
 *
 * 1. First, a marker or nothing (captured).
 * 2. Next, a space or a tab.
 * @param {string[]} markers A marker list.
 * @returns {RegExp} A RegExp object for `never` mode.
 */
function createNeverStylePattern(markers: string[]) {
  const pattern = `^(${markers.map(escapeText).join("|")})?[ \t]+`;

  return new RegExp(pattern, "u");
}
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule("spaced-comment", {
  meta: {
    docs: {
      description: "enforce consistent spacing after the `#` in a comment",
      categories: ["standard"],
      extensionRule: "spaced-comment",
      layout: false, // This rule does not conflict with Prettier.
    },
    fixable: "whitespace",
    schema: [
      {
        enum: ["always", "never"],
      },
      {
        type: "object",
        properties: {
          exceptions: {
            type: "array",
            items: {
              type: "string",
            },
          },
          markers: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedSpaceAfterMarker:
        "Unexpected space after marker ({{refChar}}) in comment.",
      expectedExceptionAfter:
        "Expected exception block, space after '{{refChar}}' in comment.",
      unexpectedSpaceAfter: "Unexpected space after '{{refChar}}' in comment.",
      expectedSpaceAfter: "Expected space after '{{refChar}}' in comment.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    // Unless the first option is never, require a space
    const requireSpace = context.options[0] !== "never";

    // Parse the second options.
    const config = context.options[1] || {};

    const markers: string[] = config.markers || [];
    const exceptions: string[] = config.exceptions || [];

    // Create RegExp object for valid patterns.
    const styleRules = {
      beginRegex: requireSpace
        ? createAlwaysStylePattern(markers, exceptions)
        : createNeverStylePattern(markers),
      hasExceptions: exceptions.length > 0,
      captureMarker: new RegExp(`^(${markers.map(escapeText).join("|")})`, "u"),
      markers: new Set(markers),
    };

    /**
     * Reports a beginning spacing error with an appropriate message.
     * @param {ASTNode} node A comment node to check.
     * @param {string} messageId An error message to report.
     * @param {Array} match An array of match results for markers.
     * @param {string} refChar Character used for reference in the error message.
     * @returns {void}
     */
    function reportBegin(
      node: AST.Comment,
      messageId: string,
      match: RegExpExecArray | null,
      refChar: string,
    ) {
      context.report({
        node,
        fix(fixer) {
          const start = node.range[0];
          let end = start + 1;

          if (requireSpace) {
            if (match) {
              end += match[0].length;
            }
            return fixer.insertTextAfterRange([start, end], " ");
          }
          end += match![0].length;
          return fixer.replaceTextRange(
            [start, end],
            `#${match?.[1] ? match[1] : ""}`,
          );
        },
        messageId,
        data: { refChar },
      });
    }

    /**
     * Reports a given comment if it's invalid.
     * @param {ASTNode} node a comment node to check.
     * @returns {void}
     */
    function checkCommentForSpace(node: AST.Comment) {
      // Ignores empty comments and comments that consist only of a marker.
      if (node.value.length === 0 || styleRules.markers.has(node.value)) {
        return;
      }

      const beginMatch = styleRules.beginRegex.exec(node.value);

      // Checks.
      if (requireSpace) {
        if (!beginMatch) {
          const hasMarker = styleRules.captureMarker.exec(node.value);
          const marker = hasMarker ? `#${hasMarker[0]}` : "#";

          if (styleRules.hasExceptions) {
            reportBegin(node, "expectedExceptionAfter", hasMarker, marker);
          } else {
            reportBegin(node, "expectedSpaceAfter", hasMarker, marker);
          }
        }
      } else {
        if (beginMatch) {
          if (!beginMatch[1]) {
            reportBegin(node, "unexpectedSpaceAfter", beginMatch, "#");
          } else {
            reportBegin(
              node,
              "unexpectedSpaceAfterMarker",
              beginMatch,
              beginMatch[1],
            );
          }
        }
      }
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach(checkCommentForSpace);
      },
    };
  },
});
