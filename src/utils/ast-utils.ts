import type { YAMLToken } from "../types"

/**
 * Checks if the given token is a comment token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a comment token.
 */
export function isCommentToken(token: YAMLToken) {
    return token.type === "Block" || token.type === "Line"
}
/**
 * Determines whether two adjacent tokens are on the same line.
 * @param {Object} left The left token object.
 * @param {Object} right The right token object.
 * @returns {boolean} Whether or not the tokens are on the same line.
 * @public
 */
export function isTokenOnSameLine(left: YAMLToken, right: YAMLToken) {
    return left.loc.end.line === right.loc.start.line
}

/**
 * Check whether the given token is a question.
 * @param token The token to check.
 * @returns `true` if the token is a question.
 */
export function isQuestion(token: YAMLToken | null): token is YAMLToken {
    return token != null && token.type === "Punctuator" && token.value === "?"
}

/**
 * Check whether the given token is a hyphen.
 * @param token The token to check.
 * @returns `true` if the token is a hyphen.
 */
export function isHyphen(token: YAMLToken | null): token is YAMLToken {
    return token != null && token.type === "Punctuator" && token.value === "-"
}

/**
 * Check whether the given token is a colon.
 * @param token The token to check.
 * @returns `true` if the token is a colon.
 */
export function isColon(token: YAMLToken | null): token is YAMLToken {
    return token != null && token.type === "Punctuator" && token.value === ":"
}
