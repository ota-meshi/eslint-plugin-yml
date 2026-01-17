import type { YAMLSyntaxElement, YAMLToken } from "./yaml-source-code.js";
import type { AST } from "yaml-eslint-parser";

/**
 * Binary search for the index of the first token that is after the given location.
 */
function search(tokens: YAMLToken[], location: number): number {
  let minIndex = 0;
  let maxIndex = tokens.length - 1;

  while (minIndex <= maxIndex) {
    const index = Math.floor((minIndex + maxIndex) / 2);
    const token = tokens[index];
    const tokenStartLocation = token.range[0];

    if (tokenStartLocation < location) {
      minIndex = index + 1;
    } else if (tokenStartLocation > location) {
      maxIndex = index - 1;
    } else {
      return index;
    }
  }

  return minIndex;
}

/**
 * Get the index of the first token that is after the given location.
 */
function getFirstIndex(
  tokens: YAMLToken[],
  indexMap: Map<number, number>,
  startLoc: number,
): number {
  const index = indexMap.get(startLoc);
  if (index != null) {
    return index;
  }
  return search(tokens, startLoc);
}

/**
 * Get the index of the last token that is before the given location.
 */
function getLastIndex(
  tokens: YAMLToken[],
  indexMap: Map<number, number>,
  endLoc: number,
): number {
  const index = indexMap.get(endLoc);
  if (index != null) {
    return index - 1;
  }
  return search(tokens, endLoc) - 1;
}

/**
 * Normalizes the options for cursor methods.
 */
function normalizeOptions(options: CursorWithSkipOptions | undefined): {
  includeComments: boolean;
  filter: FilterPredicate | null;
  skip: number;
} {
  if (typeof options === "number") {
    return { includeComments: false, filter: null, skip: options };
  }
  if (typeof options === "function") {
    return { includeComments: false, filter: options, skip: 0 };
  }
  return {
    includeComments: options?.includeComments ?? false,
    filter: options?.filter ?? null,
    skip: options?.skip ?? 0,
  };
}

/**
 * Checks if a token is a comment.
 */
function isComment(token: YAMLToken): token is AST.Comment {
  return token.type === "Block";
}

/**
 * Checks if a token is a not comment.
 */
function isNotComment(token: YAMLToken): boolean {
  return !isComment(token);
}

/**
 * Normalizes the options for cursor methods with count.
 */
function normalizeCountOptions(options: CursorWithCountOptions | undefined): {
  filter: FilterPredicate | null;
  count: number;
} {
  if (typeof options === "number") {
    return { filter: isNotComment, count: options };
  }
  if (typeof options === "function") {
    return {
      filter: (n) => {
        if (isComment(n)) {
          return false;
        }
        return options(n);
      },
      count: 0,
    };
  }
  let filter = options?.filter;
  if (!options?.includeComments) {
    if (filter) {
      const baseFilter = filter;
      filter = (token: YAMLToken) => {
        if (isComment(token)) {
          return false;
        }
        return baseFilter(token);
      };
    } else {
      filter = isNotComment;
    }
  }
  return {
    filter: filter ?? null,
    count: options?.count ?? 0,
  };
}

export class TokenStore {
  /**
   * Combined and sorted list of tokens and comments
   */
  private readonly allTokens: YAMLToken[];

  /**
   * Map from token start location to index in allTokens
   */
  private readonly tokenStartToIndex: Map<number, number>;

  public constructor(params: { ast: AST.YAMLProgram }) {
    const tokens = params.ast.tokens || [];
    const comments = params.ast.comments || [];

    // Merge and sort tokens and comments by range start
    this.allTokens = [...tokens, ...comments].sort(
      (a, b) => a.range[0] - b.range[0],
    );

    // Create index map for fast lookup
    this.tokenStartToIndex = new Map();
    for (let i = 0; i < this.allTokens.length; i++) {
      this.tokenStartToIndex.set(this.allTokens[i].range[0], i);
    }
  }

  /**
   * Gets the first token of the given node.
   */
  public getFirstToken(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    const { filter, skip } = normalizeOptions(options);
    const startIndex = getFirstIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[0],
    );
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[1],
    );

    let skipped = 0;
    for (let i = startIndex; i <= endIndex && i < this.allTokens.length; i++) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      if (skipped < skip) {
        skipped++;
        continue;
      }
      return token;
    }
    return null;
  }

  /**
   * Gets the last token of the given node.
   */
  public getLastToken(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    const { filter, skip } = normalizeOptions(options);
    const startIndex = getFirstIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[0],
    );
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[1],
    );

    let skipped = 0;
    for (let i = endIndex; i >= startIndex && i >= 0; i--) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      if (skipped < skip) {
        skipped++;
        continue;
      }
      return token;
    }
    return null;
  }

  /**
   * Gets the first token between two non-overlapping nodes.
   */
  public getFirstTokenBetween(
    left: YAMLSyntaxElement,
    right: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    const { filter, skip } = normalizeOptions(options);
    const startIndex = getFirstIndex(
      this.allTokens,
      this.tokenStartToIndex,
      left.range[1],
    );
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      right.range[0],
    );

    let skipped = 0;
    for (let i = startIndex; i <= endIndex && i < this.allTokens.length; i++) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      if (skipped < skip) {
        skipped++;
        continue;
      }
      return token;
    }
    return null;
  }

  /**
   * Gets the token that precedes a given node or token.
   */
  public getTokenBefore(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    const { filter, skip } = normalizeOptions(options);
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[0],
    );

    let skipped = 0;
    for (let i = endIndex; i >= 0; i--) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      if (skipped < skip) {
        skipped++;
        continue;
      }
      return token;
    }
    return null;
  }

  /**
   * Gets the token that follows a given node or token.
   */
  public getTokenAfter(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    const { filter, skip } = normalizeOptions(options);
    const startIndex = getFirstIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[1],
    );

    let skipped = 0;
    for (let i = startIndex; i < this.allTokens.length; i++) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      if (skipped < skip) {
        skipped++;
        continue;
      }
      return token;
    }
    return null;
  }

  /**
   * Gets the `count` tokens that precedes a given node or token.
   */
  public getTokensBefore(
    node: YAMLSyntaxElement,
    options: CursorWithCountOptions | undefined,
  ): YAMLToken[] {
    const { filter, count } = normalizeCountOptions(options);
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[0],
    );

    const result: YAMLToken[] = [];
    for (let i = endIndex; i >= 0; i--) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      result.unshift(token);
      if (count > 0 && result.length >= count) {
        break;
      }
    }
    return result;
  }

  /**
   * Gets all tokens that are related to the given node.
   */
  public getTokens(
    node: AST.YAMLNode,
    options?: CursorWithCountOptions,
  ): YAMLToken[] {
    const { filter, count } = normalizeCountOptions(options);
    const startIndex = getFirstIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[0],
    );
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      node.range[1],
    );

    const result: YAMLToken[] = [];
    for (let i = startIndex; i <= endIndex && i < this.allTokens.length; i++) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      result.push(token);
      if (count > 0 && result.length >= count) {
        break;
      }
    }
    return result;
  }

  /**
   * Gets all of the tokens between two non-overlapping nodes.
   */
  public getTokensBetween(
    left: YAMLSyntaxElement,
    right: YAMLSyntaxElement,
    paddingOrOptions?: CursorWithCountOptions,
  ): YAMLToken[] {
    const { filter, count } = normalizeCountOptions(paddingOrOptions);
    const startIndex = getFirstIndex(
      this.allTokens,
      this.tokenStartToIndex,
      left.range[1],
    );
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      right.range[0],
    );

    const result: YAMLToken[] = [];
    for (let i = startIndex; i <= endIndex && i < this.allTokens.length; i++) {
      const token = this.allTokens[i];
      if (filter && !filter(token)) {
        continue;
      }
      result.push(token);
      if (count > 0 && result.length >= count) {
        break;
      }
    }
    return result;
  }

  /**
   * Gets all comment tokens directly before the given node or token.
   */
  public getCommentsBefore(nodeOrToken: YAMLSyntaxElement): AST.Comment[] {
    const endIndex = getLastIndex(
      this.allTokens,
      this.tokenStartToIndex,
      nodeOrToken.range[0],
    );

    const result: AST.Comment[] = [];
    for (let i = endIndex; i >= 0; i--) {
      const token = this.allTokens[i];
      if (isComment(token)) {
        result.unshift(token);
      } else {
        // Stop at the first non-comment token
        break;
      }
    }
    return result;
  }

  /**
   * Gets all comment tokens directly after the given node or token.
   */
  public getCommentsAfter(nodeOrToken: YAMLSyntaxElement): AST.Comment[] {
    const startIndex = getFirstIndex(
      this.allTokens,
      this.tokenStartToIndex,
      nodeOrToken.range[1],
    );

    const result: AST.Comment[] = [];
    for (let i = startIndex; i < this.allTokens.length; i++) {
      const token = this.allTokens[i];
      if (isComment(token)) {
        result.push(token);
      } else {
        // Stop at the first non-comment token
        break;
      }
    }
    return result;
  }
}

export type FilterPredicate = (tokenOrComment: YAMLToken) => boolean;

export type CursorWithSkipOptions =
  | number
  | FilterPredicate
  | {
      includeComments?: boolean;
      filter?: FilterPredicate;
      skip?: number;
    };

export type CursorWithCountOptions =
  | number
  | FilterPredicate
  | {
      includeComments?: boolean;
      filter?: FilterPredicate;
      count?: number;
    };
