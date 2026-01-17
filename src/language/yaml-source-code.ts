/**
 * @fileoverview The YAMLSourceCode class.
 */

import { traverseNodes, type AST } from "yaml-eslint-parser";
import type {
  TraversalStep,
  IDirective as Directive,
} from "@eslint/plugin-kit";
import {
  TextSourceCodeBase,
  CallMethodStep,
  VisitNodeStep,
  ConfigCommentParser,
  Directive as DirectiveImpl,
} from "@eslint/plugin-kit";
import type { DirectiveType, FileProblem, RulesConfig } from "@eslint/core";
import type {
  CursorWithCountOptions,
  CursorWithSkipOptions,
  FilterPredicate,
} from "./token-store.js";
import { TokenStore } from "./token-store.js";
import type { Scope } from "eslint";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const commentParser = new ConfigCommentParser();

/**
 * Pattern to match ESLint inline configuration comments in YAML.
 * Matches: eslint, eslint-disable, eslint-enable, eslint-disable-line, eslint-disable-next-line
 */
const INLINE_CONFIG =
  /^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u;

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------
/**
 * YAML-specific syntax element type
 */
export type YAMLSyntaxElement = AST.YAMLNode | AST.Token | AST.Comment;
export type YAMLToken = AST.Token | AST.Comment;

/**
 * YAML Source Code Object
 */
export class YAMLSourceCode extends TextSourceCodeBase<{
  LangOptions: Record<never, never>;
  RootNode: AST.YAMLProgram;
  SyntaxElementWithLoc: YAMLSyntaxElement;
  ConfigNode: AST.Comment;
}> {
  public readonly hasBOM: boolean;

  public readonly parserServices: { isYAML?: boolean; parseError?: unknown };

  public readonly visitorKeys: Record<string, string[]>;

  private readonly tokenStore: TokenStore;

  #steps: TraversalStep[] | null = null;

  #cacheTokensAndComments: (AST.Token | AST.Comment)[] | null = null;

  #inlineConfigComments: AST.Comment[] | null = null;

  /**
   * Creates a new instance.
   */
  public constructor(config: {
    text: string;
    ast: AST.YAMLProgram;
    hasBOM: boolean;
    parserServices: { isYAML: boolean; parseError?: unknown };
    visitorKeys?: Record<string, string[]> | null | undefined;
  }) {
    super({
      ast: config.ast,
      text: config.text,
    });
    this.hasBOM = Boolean(config.hasBOM);
    this.parserServices = config.parserServices;
    this.visitorKeys = config.visitorKeys || {};
    this.tokenStore = new TokenStore({ ast: this.ast });
  }

  public traverse(): Iterable<TraversalStep> {
    if (this.#steps != null) {
      return this.#steps;
    }

    const steps: (VisitNodeStep | CallMethodStep)[] = [];
    this.#steps = steps;

    const root = this.ast;
    steps.push(
      // ESLint core rule compatibility: onCodePathStart is called with two arguments.
      new CallMethodStep({
        target: "onCodePathStart",
        args: [{}, root],
      }),
    );

    traverseNodes(root, {
      enterNode(n) {
        steps.push(
          new VisitNodeStep({
            target: n,
            phase: 1,
            args: [n],
          }),
        );
      },
      leaveNode(n) {
        steps.push(
          new VisitNodeStep({
            target: n,
            phase: 2,
            args: [n],
          }),
        );
      },
    });

    steps.push(
      // ESLint core rule compatibility: onCodePathEnd is called with two arguments.
      new CallMethodStep({
        target: "onCodePathEnd",
        args: [{}, root],
      }),
    );
    return steps;
  }

  /**
   * Gets all tokens and comments.
   */
  public get tokensAndComments(): YAMLToken[] {
    return (this.#cacheTokensAndComments ??= [
      ...this.ast.tokens,
      ...this.ast.comments,
    ].sort((a, b) => a.range[0] - b.range[0]));
  }

  public getLines(): string[] {
    return this.lines;
  }

  public getAllComments(): AST.Comment[] {
    return this.ast.comments;
  }

  /**
   * Returns an array of all inline configuration nodes found in the source code.
   * This includes eslint-disable, eslint-enable, eslint-disable-line,
   * eslint-disable-next-line, and eslint (for inline config) comments.
   */
  public getInlineConfigNodes(): AST.Comment[] {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = this.ast.comments.filter((comment) =>
        INLINE_CONFIG.test(comment.value),
      );
    }

    return this.#inlineConfigComments;
  }

  /**
   * Returns directives that enable or disable rules along with any problems
   * encountered while parsing the directives.
   */
  public getDisableDirectives(): {
    directives: Directive[];
    problems: FileProblem[];
  } {
    const problems: FileProblem[] = [];
    const directives: Directive[] = [];

    this.getInlineConfigNodes().forEach((comment) => {
      const directive = commentParser.parseDirective(comment.value);

      if (!directive) {
        return;
      }

      const { label, value, justification } = directive;

      // `eslint-disable-line` directives are not allowed to span multiple lines
      // as it would be confusing to which lines they apply
      if (
        label === "eslint-disable-line" &&
        comment.loc.start.line !== comment.loc.end.line
      ) {
        const message = `${label} comment should not span multiple lines.`;

        problems.push({
          ruleId: null,
          message,
          loc: comment.loc,
        });
        return;
      }

      switch (label) {
        case "eslint-disable":
        case "eslint-enable":
        case "eslint-disable-next-line":
        case "eslint-disable-line": {
          const directiveType = label.slice("eslint-".length);

          directives.push(
            new DirectiveImpl({
              type: directiveType as DirectiveType,
              node: comment,
              value,
              justification,
            }),
          );
          break;
        }
        // no default
      }
    });

    return { problems, directives };
  }

  /**
   * Returns inline rule configurations along with any problems
   * encountered while parsing the configurations.
   */
  public applyInlineConfig(): {
    configs: { config: { rules: RulesConfig }; loc: AST.SourceLocation }[];
    problems: FileProblem[];
  } {
    const problems: FileProblem[] = [];
    const configs: {
      config: { rules: RulesConfig };
      loc: AST.SourceLocation;
    }[] = [];

    this.getInlineConfigNodes().forEach((comment) => {
      const directive = commentParser.parseDirective(comment.value);

      if (!directive) {
        return;
      }

      const { label, value } = directive;

      if (label === "eslint") {
        const parseResult = commentParser.parseJSONLikeConfig(value);

        if (parseResult.ok) {
          configs.push({
            config: {
              rules: parseResult.config,
            },
            loc: comment.loc,
          });
        } else {
          problems.push({
            ruleId: null,
            message: parseResult.error.message,
            loc: comment.loc,
          });
        }
      }
    });

    return { configs, problems };
  }

  public getNodeByRangeIndex(index: number): AST.YAMLNode | null {
    let node = find([this.ast]);
    if (!node) return null;
    while (true) {
      const child = find(this._getChildren(node));
      if (!child) return node;
      node = child;
    }

    /**
     * Finds a node that contains the given index.
     */
    function find(nodes: AST.YAMLNode[]) {
      for (const node of nodes) {
        if (node.range[0] <= index && index < node.range[1]) {
          return node;
        }
      }
      return null;
    }
  }

  public getFirstToken(node: YAMLSyntaxElement): AST.Token;

  public getFirstToken(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null;

  public getFirstToken(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    return this.tokenStore.getFirstToken(node, options);
  }

  public getLastToken(node: YAMLSyntaxElement): AST.Token;

  public getLastToken(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null;

  public getLastToken(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    return this.tokenStore.getLastToken(node, options);
  }

  public getTokenBefore(node: YAMLSyntaxElement): AST.Token | null;

  public getTokenBefore(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null;

  public getTokenBefore(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    return this.tokenStore.getTokenBefore(node, options);
  }

  public getTokensBefore(
    node: YAMLSyntaxElement,
    options?: CursorWithCountOptions,
  ): YAMLToken[] {
    return this.tokenStore.getTokensBefore(node, options);
  }

  public getTokenAfter(node: YAMLSyntaxElement): AST.Token | null;

  public getTokenAfter(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null;

  public getTokenAfter(
    node: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    return this.tokenStore.getTokenAfter(node, options);
  }

  public getFirstTokenBetween(
    left: YAMLSyntaxElement,
    right: YAMLSyntaxElement,
    options?: CursorWithSkipOptions,
  ): YAMLToken | null {
    return this.tokenStore.getFirstTokenBetween(left, right, options);
  }

  public getTokensBetween(
    left: YAMLSyntaxElement,
    right: YAMLSyntaxElement,
    paddingOrOptions?: number | FilterPredicate | CursorWithCountOptions,
  ): YAMLToken[] {
    return this.tokenStore.getTokensBetween(left, right, paddingOrOptions);
  }

  public getTokens(
    node: AST.YAMLNode,
    options?: FilterPredicate | CursorWithCountOptions,
  ): YAMLToken[] {
    return this.tokenStore.getTokens(node, options);
  }

  public getCommentsBefore(nodeOrToken: YAMLSyntaxElement): AST.Comment[] {
    return this.tokenStore.getCommentsBefore(nodeOrToken);
  }

  public getCommentsAfter(nodeOrToken: YAMLSyntaxElement): AST.Comment[] {
    return this.tokenStore.getCommentsAfter(nodeOrToken);
  }

  public isSpaceBetween(first: YAMLToken, second: YAMLToken): boolean {
    if (nodesOrTokensOverlap(first, second)) {
      return false;
    }

    const [startingNodeOrToken, endingNodeOrToken] =
      first.range[1] <= second.range[0] ? [first, second] : [second, first];
    const firstToken =
      this.getLastToken(startingNodeOrToken) || startingNodeOrToken;
    const finalToken =
      this.getFirstToken(endingNodeOrToken) || endingNodeOrToken;
    let currentToken: YAMLToken = firstToken;

    while (currentToken !== finalToken) {
      const nextToken: YAMLToken = this.getTokenAfter(currentToken, {
        includeComments: true,
      })!;

      if (currentToken.range[1] !== nextToken.range[0]) {
        return true;
      }

      currentToken = nextToken;
    }

    return false;
  }

  /**
   * Compatibility for ESLint's SourceCode API
   * @deprecated YAML does not have scopes
   */
  public getScope(node?: AST.YAMLNode): Scope.Scope | null {
    if (node?.type !== "Program") {
      return null;
    }
    const fakeGlobalScope: Scope.Scope = {
      type: "global",
      block: node as never,
      set: new Map(),
      through: [],
      childScopes: [],
      variableScope: null as never,
      variables: [],
      references: [],
      functionExpressionScope: false,
      isStrict: false,
      upper: null,
      implicit: {
        variables: [],
        set: new Map(),
      },
    };
    fakeGlobalScope.variableScope = fakeGlobalScope;
    return fakeGlobalScope;
  }

  /**
   * Compatibility for ESLint's SourceCode API
   * @deprecated
   */
  public isSpaceBetweenTokens(first: YAMLToken, second: YAMLToken): boolean {
    return this.isSpaceBetween(first, second);
  }

  private _getChildren(node: AST.YAMLNode) {
    const keys = this.visitorKeys[node.type] || [];
    const children: AST.YAMLNode[] = [];
    for (const key of keys) {
      const value = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        for (const element of value) {
          if (isNode(element)) {
            children.push(element);
          }
        }
      } else if (isNode(value)) {
        children.push(value);
      }
    }
    return children;
  }
}

/**
 * Determines whether the given value is a YAML AST node.
 */
function isNode(value: unknown): value is AST.YAMLNode {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).type === "string" &&
    Array.isArray((value as Record<string, unknown>).range) &&
    Boolean((value as Record<string, unknown>).loc) &&
    typeof (value as Record<string, unknown>).loc === "object"
  );
}

/**
 * Determines whether two nodes or tokens overlap.
 */
function nodesOrTokensOverlap(first: YAMLToken, second: YAMLToken): boolean {
  return first.range[0] < second.range[1] && second.range[0] < first.range[1];
}
