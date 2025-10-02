import type { YAMLToken } from "../types";

/**
 * Checks if the given token is a comment token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a comment token.
 */
export function isCommentToken(token: YAMLToken | null): boolean {
  return Boolean(token && (token.type === "Block" || token.type === "Line"));
}
/**
 * Determines whether two adjacent tokens are on the same line.
 * @param {Object} left The left token object.
 * @param {Object} right The right token object.
 * @returns {boolean} Whether or not the tokens are on the same line.
 * @public
 */
export function isTokenOnSameLine(left: YAMLToken, right: YAMLToken): boolean {
  return left.loc.end.line === right.loc.start.line;
}

/**
 * Check whether the given token is a question.
 * @param token The token to check.
 * @returns `true` if the token is a question.
 */
export function isQuestion(token: YAMLToken | null): token is YAMLToken {
  return token != null && token.type === "Punctuator" && token.value === "?";
}

/**
 * Check whether the given token is a hyphen.
 * @param token The token to check.
 * @returns `true` if the token is a hyphen.
 */
export function isHyphen(token: YAMLToken | null): token is YAMLToken {
  return token != null && token.type === "Punctuator" && token.value === "-";
}

/**
 * Check whether the given token is a colon.
 * @param token The token to check.
 * @returns `true` if the token is a colon.
 */
export function isColon(token: YAMLToken | null): token is YAMLToken {
  return token != null && token.type === "Punctuator" && token.value === ":";
}

/**
 * Check whether the given token is a comma.
 * @param token The token to check.
 * @returns `true` if the token is a comma.
 */
export function isComma(
  token: YAMLToken | null,
): token is YAMLToken & { type: "Punctuator"; value: "," } {
  return token != null && token.type === "Punctuator" && token.value === ",";
}

/**
 * Checks if the given token is an opening square bracket token or not.
 * @param token The token to check.
 * @returns `true` if the token is an opening square bracket token.
 */
export function isOpeningBracketToken(
  token: YAMLToken | null,
): token is YAMLToken {
  return token != null && token.value === "[" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a closing square bracket token or not.
 * @param token The token to check.
 * @returns `true` if the token is a closing square bracket token.
 */
export function isClosingBracketToken(
  token: YAMLToken | null,
): token is YAMLToken {
  return token != null && token.value === "]" && token.type === "Punctuator";
}

/**
 * Checks if the given token is an opening brace token or not.
 * @param token The token to check.
 * @returns `true` if the token is an opening brace token.
 */
export function isOpeningBraceToken(
  token: YAMLToken | null,
): token is YAMLToken {
  return token != null && token.value === "{" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a closing brace token or not.
 * @param token The token to check.
 * @returns `true` if the token is a closing brace token.
 */
export function isClosingBraceToken(
  token: YAMLToken | null,
): token is YAMLToken {
  return token != null && token.value === "}" && token.type === "Punctuator";
}
