import type { RuleFixer, SourceCode } from "../types";
import naturalCompare from "natural-compare";
import type { AST } from "yaml-eslint-parser";
import { createRule } from "../utils/index";
import { isComma, isCommentToken } from "../utils/ast-utils";
import { getSourceCode } from "../utils/compat";
import { calcShortestEditScript } from "../utils/calc-shortest-edit-script";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

type UserOptions = CompatibleWithESLintOptions | PatternOption[];

type OrderTypeOption = "asc" | "desc";
type CompatibleWithESLintOptions =
  | []
  | [OrderTypeOption]
  | [
      OrderTypeOption,
      {
        caseSensitive?: boolean;
        natural?: boolean;
        minKeys?: number;
        allowLineSeparatedGroups?: boolean;
      },
    ];
type PatternOption = {
  pathPattern: string;
  hasProperties: string[];
  order:
    | OrderObject
    | (
        | string
        | {
            keyPattern?: string;
            order?: OrderObject;
          }
      )[];
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
};
type OrderObject = {
  type?: OrderTypeOption;
  caseSensitive?: boolean;
  natural?: boolean;
};
type ParsedOption = {
  isTargetMapping: (node: YAMLMappingData) => boolean;
  ignore: (data: YAMLPairData) => boolean;
  isValidOrder: Validator;
  allowLineSeparatedGroups: boolean;
  orderText: string;
};
type Validator = (prev: YAMLPairData, next: YAMLPairData) => boolean;

/**
 * Checks whether the given string is new line.
 */
function isNewLine(char: string) {
  return (
    char === "\n" || char === "\r" || char === "\u2028" || char === "\u2029"
  );
}

/**
 * Gets the property name of the given `YAMLPair` node.
 */
function getPropertyName(node: AST.YAMLPair, sourceCode: SourceCode): string {
  const prop = node.key;
  if (prop == null) {
    return "";
  }
  const target = prop.type === "YAMLWithMeta" ? prop.value : prop;
  if (target == null) {
    return "";
  }
  if (target.type === "YAMLScalar" && typeof target.value === "string") {
    return target.value;
  }
  return sourceCode.text.slice(...target.range);
}

class YAMLPairData {
  public readonly mapping: YAMLMappingData;

  public readonly node: AST.YAMLPair;

  public readonly index: number;

  public readonly anchorAlias: {
    anchors: Set<string>;
    aliases: Set<string>;
  };

  private cachedName: string | null = null;

  public get reportLoc() {
    return this.node.key?.loc ?? this.node.loc;
  }

  public constructor(
    mapping: YAMLMappingData,
    node: AST.YAMLPair,
    index: number,
    anchorAlias: {
      anchors: Set<string>;
      aliases: Set<string>;
    },
  ) {
    this.mapping = mapping;
    this.node = node;
    this.index = index;
    this.anchorAlias = anchorAlias;
  }

  public get name() {
    return (this.cachedName ??= getPropertyName(
      this.node,
      this.mapping.sourceCode,
    ));
  }

  public getPrev(): YAMLPairData | null {
    const prevIndex = this.index - 1;
    return prevIndex >= 0 ? this.mapping.pairs[prevIndex] : null;
  }
}
class YAMLMappingData {
  public readonly node: AST.YAMLMapping;

  public readonly sourceCode: SourceCode;

  private readonly anchorAliasMap: Map<
    AST.YAMLPair,
    {
      anchors: Set<string>;
      aliases: Set<string>;
    }
  >;

  private cachedProperties: YAMLPairData[] | null = null;

  public constructor(
    node: AST.YAMLMapping,
    sourceCode: SourceCode,
    anchorAliasMap: Map<
      AST.YAMLPair,
      {
        anchors: Set<string>;
        aliases: Set<string>;
      }
    >,
  ) {
    this.node = node;
    this.sourceCode = sourceCode;
    this.anchorAliasMap = anchorAliasMap;
  }

  public get pairs() {
    return (this.cachedProperties ??= this.node.pairs.map(
      (e, index) =>
        new YAMLPairData(this, e, index, this.anchorAliasMap.get(e)!),
    ));
  }

  public getPath(sourceCode: SourceCode): string {
    let path = "";
    let curr: AST.YAMLNode = this.node;
    let p: AST.YAMLNode | null = curr.parent;
    while (p) {
      if (p.type === "YAMLPair") {
        const name = getPropertyName(p, sourceCode);
        if (/^[$a-z_][\w$]*$/iu.test(name)) {
          path = `.${name}${path}`;
        } else {
          path = `[${JSON.stringify(name)}]${path}`;
        }
      } else if (p.type === "YAMLSequence") {
        const index = p.entries.indexOf(curr as never);
        path = `[${index}]${path}`;
      }
      curr = p;
      p = curr.parent;
    }
    if (path.startsWith(".")) {
      path = path.slice(1);
    }
    return path;
  }
}

/**
 * Check if given options are CompatibleWithESLintOptions
 */
function isCompatibleWithESLintOptions(
  options: UserOptions,
): options is CompatibleWithESLintOptions {
  if (options.length === 0) {
    return true;
  }
  if (typeof options[0] === "string" || options[0] == null) {
    return true;
  }

  return false;
}

/**
 * Build function which check that the given 2 names are in specific order.
 */
function buildValidatorFromType(
  order: OrderTypeOption,
  insensitive: boolean,
  natural: boolean,
): Validator {
  let compare = natural
    ? ([a, b]: string[]) => naturalCompare(a, b) <= 0
    : ([a, b]: string[]) => a <= b;
  if (insensitive) {
    const baseCompare = compare;
    compare = ([a, b]: string[]) =>
      baseCompare([a.toLowerCase(), b.toLowerCase()]);
  }
  if (order === "desc") {
    const baseCompare = compare;
    compare = (args: string[]) => baseCompare(args.reverse());
  }
  return (a: YAMLPairData, b: YAMLPairData) => compare([a.name, b.name]);
}

/**
 * Parse options
 */
function parseOptions(
  options: UserOptions,
  sourceCode: SourceCode,
): ParsedOption[] {
  if (isCompatibleWithESLintOptions(options)) {
    const type: OrderTypeOption = options[0] ?? "asc";
    const obj = options[1] ?? {};
    const insensitive = obj.caseSensitive === false;
    const natural = Boolean(obj.natural);
    const minKeys: number = obj.minKeys ?? 2;
    const allowLineSeparatedGroups = obj.allowLineSeparatedGroups || false;
    return [
      {
        isTargetMapping: (data) => data.node.pairs.length >= minKeys,
        ignore: () => false,
        isValidOrder: buildValidatorFromType(type, insensitive, natural),
        orderText: `${natural ? "natural " : ""}${
          insensitive ? "insensitive " : ""
        }${type}ending`,
        allowLineSeparatedGroups,
      },
    ];
  }

  return options.map((opt) => {
    const order = opt.order;
    const pathPattern = new RegExp(opt.pathPattern);
    const hasProperties = opt.hasProperties ?? [];
    const minKeys: number = opt.minKeys ?? 2;
    const allowLineSeparatedGroups = opt.allowLineSeparatedGroups || false;
    if (!Array.isArray(order)) {
      const type: OrderTypeOption = order.type ?? "asc";
      const insensitive = order.caseSensitive === false;
      const natural = Boolean(order.natural);

      return {
        isTargetMapping,
        ignore: () => false,
        isValidOrder: buildValidatorFromType(type, insensitive, natural),
        orderText: `${natural ? "natural " : ""}${
          insensitive ? "insensitive " : ""
        }${type}ending`,
        allowLineSeparatedGroups,
      };
    }
    const parsedOrder: {
      test: (data: YAMLPairData) => boolean;
      isValidNestOrder: Validator;
    }[] = [];
    for (const o of order) {
      if (typeof o === "string") {
        parsedOrder.push({
          test: (data) => data.name === o,
          isValidNestOrder: () => true,
        });
      } else {
        const keyPattern = o.keyPattern ? new RegExp(o.keyPattern) : null;
        const nestOrder = o.order ?? {};
        const type: OrderTypeOption = nestOrder.type ?? "asc";
        const insensitive = nestOrder.caseSensitive === false;
        const natural = Boolean(nestOrder.natural);
        parsedOrder.push({
          test: (data) => (keyPattern ? keyPattern.test(data.name) : true),
          isValidNestOrder: buildValidatorFromType(type, insensitive, natural),
        });
      }
    }
    return {
      isTargetMapping,
      ignore: (data) => parsedOrder.every((p) => !p.test(data)),
      isValidOrder(a, b) {
        for (const p of parsedOrder) {
          const matchA = p.test(a);
          const matchB = p.test(b);
          if (!matchA || !matchB) {
            if (matchA) {
              return true;
            }
            if (matchB) {
              return false;
            }
            continue;
          }
          return p.isValidNestOrder(a, b);
        }
        return false;
      },
      orderText: "specified",
      allowLineSeparatedGroups,
    };

    /**
     * Checks whether given node is verify target
     */
    function isTargetMapping(data: YAMLMappingData) {
      if (data.node.pairs.length < minKeys) {
        return false;
      }
      if (hasProperties.length > 0) {
        const names = new Set(data.pairs.map((p) => p.name));
        if (!hasProperties.every((name) => names.has(name))) {
          return false;
        }
      }

      return pathPattern.test(data.getPath(sourceCode));
    }
  });
}

const ALLOW_ORDER_TYPES: OrderTypeOption[] = ["asc", "desc"];
const ORDER_OBJECT_SCHEMA = {
  type: "object",
  properties: {
    type: {
      enum: ALLOW_ORDER_TYPES,
    },
    caseSensitive: {
      type: "boolean",
    },
    natural: {
      type: "boolean",
    },
  },
  additionalProperties: false,
} as const;

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule("sort-keys", {
  meta: {
    docs: {
      description: "require mapping keys to be sorted",
      categories: null,
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: {
      oneOf: [
        {
          type: "array",
          items: {
            type: "object",
            properties: {
              pathPattern: { type: "string" },
              hasProperties: {
                type: "array",
                items: { type: "string" },
              },
              order: {
                oneOf: [
                  {
                    type: "array",
                    items: {
                      anyOf: [
                        { type: "string" },
                        {
                          type: "object",
                          properties: {
                            keyPattern: {
                              type: "string",
                            },
                            order: ORDER_OBJECT_SCHEMA,
                          },
                          additionalProperties: false,
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                  ORDER_OBJECT_SCHEMA,
                ],
              },
              minKeys: {
                type: "integer",
                minimum: 2,
              },
              allowLineSeparatedGroups: {
                type: "boolean",
              },
            },
            required: ["pathPattern", "order"],
            additionalProperties: false,
          },
          minItems: 1,
        },
        // For options compatible with the ESLint core.
        {
          type: "array",
          items: [
            {
              enum: ALLOW_ORDER_TYPES,
            },
            {
              type: "object",
              properties: {
                caseSensitive: {
                  type: "boolean",
                },
                natural: {
                  type: "boolean",
                },
                minKeys: {
                  type: "integer",
                  minimum: 2,
                },
                allowLineSeparatedGroups: {
                  type: "boolean",
                },
              },
              additionalProperties: false,
            },
          ],
          additionalItems: false,
        },
      ],
    },

    messages: {
      shouldBeBefore:
        "Expected mapping keys to be in {{orderText}} order. '{{thisName}}' should be before '{{targetName}}'.",
      shouldBeAfter:
        "Expected mapping keys to be in {{orderText}} order. '{{thisName}}' should be after '{{targetName}}'.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices?.isYAML) {
      return {};
    }

    // Parse options.
    const parsedOptions = parseOptions(context.options, sourceCode);

    /**
     * Checks whether the given two pairs are in should be kept order.
     */
    function shouldKeepOrder(prevData: YAMLPairData, nextData: YAMLPairData) {
      if (
        (prevData.anchorAlias.aliases.size === 0 &&
          prevData.anchorAlias.anchors.size === 0) ||
        (nextData.anchorAlias.aliases.size === 0 &&
          nextData.anchorAlias.anchors.size === 0)
      )
        return false;
      for (const aliasName of nextData.anchorAlias.aliases) {
        if (prevData.anchorAlias.anchors.has(aliasName)) {
          // The current order is correct for handling anchors.
          return true;
        }
      }
      for (const anchorName of nextData.anchorAlias.anchors) {
        if (prevData.anchorAlias.aliases.has(anchorName)) {
          // The current order is correct for handling anchors.
          return true;
        }
      }
      return false;
    }

    /**
     * Check ignore
     */
    function ignore(data: YAMLPairData, option: ParsedOption) {
      if (!data.node.key && !data.node.value) {
        // ignore
        return true;
      }
      return option.ignore(data);
    }

    /**
     * Group YAML pairs.
     */
    function groupingPairs(pairs: YAMLPairData[], option: ParsedOption) {
      const groups: YAMLPairData[][] = [];

      let group: YAMLPairData[] = [];
      let prev: YAMLPairData | null = null;
      for (const pair of pairs) {
        if (ignore(pair, option)) {
          prev = pair;
          continue;
        }
        if (
          prev &&
          option.allowLineSeparatedGroups &&
          hasBlankLine(prev, pair)
        ) {
          if (group.length > 0) {
            groups.push(group);
            group = [];
          }
        }
        group.push(pair);
        prev = pair;
      }
      if (group.length > 0) {
        groups.push(group);
      }
      return groups;
    }

    /**
     * Sort pairs by bubble sort.
     */
    function bubbleSort(pairs: YAMLPairData[], option: ParsedOption) {
      const l = pairs.length;
      const result = [...pairs];
      let swapped: boolean;
      do {
        swapped = false;
        for (let nextIndex = 1; nextIndex < l; nextIndex++) {
          const prevIndex = nextIndex - 1;
          if (
            option.isValidOrder(result[prevIndex], result[nextIndex]) ||
            shouldKeepOrder(result[prevIndex], result[nextIndex])
          )
            continue;
          [result[prevIndex], result[nextIndex]] = [
            result[nextIndex],
            result[prevIndex],
          ];
          swapped = true;
        }
      } while (swapped);
      return result;
    }

    /**
     * Verify for pairs order
     */
    function verifyPairs(pairs: YAMLPairData[], option: ParsedOption) {
      const sorted = bubbleSort(pairs, option);
      const editScript = calcShortestEditScript(pairs, sorted);
      for (let index = 0; index < editScript.length; index++) {
        const edit = editScript[index];
        if (edit.type !== "delete") continue;
        const insertEditIndex = editScript.findIndex(
          (e) => e.type === "insert" && e.b === edit.a,
        );
        if (insertEditIndex === -1) {
          // should not happen
          continue;
        }
        if (index < insertEditIndex) {
          const target = findInsertAfterTarget(edit.a, insertEditIndex);
          if (!target) {
            // should not happen
            continue;
          }
          context.report({
            loc: edit.a.reportLoc,
            messageId: "shouldBeAfter",
            data: {
              thisName: edit.a.name,
              targetName: target.name,
              orderText: option.orderText,
            },
            *fix(fixer) {
              if (edit.a.mapping.node.style === "flow") {
                yield* fixToMoveDownForFlow(fixer, edit.a, target);
              } else {
                yield* fixToMoveDownForBlock(fixer, edit.a, target);
              }
            },
          });
        } else {
          const target = findInsertBeforeTarget(edit.a, insertEditIndex);
          if (!target) {
            // should not happen
            continue;
          }
          context.report({
            loc: edit.a.reportLoc,
            messageId: "shouldBeBefore",
            data: {
              thisName: edit.a.name,
              targetName: target.name,
              orderText: option.orderText,
            },
            *fix(fixer) {
              if (edit.a.mapping.node.style === "flow") {
                yield* fixToMoveUpForFlow(fixer, edit.a, target);
              } else {
                yield* fixToMoveUpForBlock(fixer, edit.a, target);
              }
            },
          });
        }
      }

      /**
       * Find insert after target
       */
      function findInsertAfterTarget(
        pair: YAMLPairData,
        insertEditIndex: number,
      ) {
        let candidate: YAMLPairData | null = null;
        for (let index = insertEditIndex - 1; index >= 0; index--) {
          const edit = editScript[index];
          if (edit.type === "delete" && edit.a === pair) break;
          if (edit.type !== "common") continue;
          candidate = edit.a;
          break;
        }
        const pairIndex = pairs.indexOf(pair);
        if (candidate) {
          for (let index = pairIndex + 1; index < pairs.length; index++) {
            const element = pairs[index];
            if (element === candidate) return candidate;
            if (shouldKeepOrder(pair, element)) {
              break;
            }
          }
        }

        let lastTarget: YAMLPairData | null = null;
        for (let index = pairIndex + 1; index < pairs.length; index++) {
          const element = pairs[index];
          if (
            option.isValidOrder(element, pair) &&
            !shouldKeepOrder(pair, element)
          ) {
            lastTarget = element;
            continue;
          }
          return lastTarget;
        }
        return lastTarget;
      }

      /**
       * Find insert before target
       */
      function findInsertBeforeTarget(
        pair: YAMLPairData,
        insertEditIndex: number,
      ) {
        let candidate: YAMLPairData | null = null;
        for (
          let index = insertEditIndex + 1;
          index < editScript.length;
          index++
        ) {
          const edit = editScript[index];
          if (edit.type === "delete" && edit.a === pair) break;
          if (edit.type !== "common") continue;
          candidate = edit.a;
          break;
        }
        const pairIndex = pairs.indexOf(pair);
        if (candidate) {
          for (let index = pairIndex - 1; index >= 0; index--) {
            const element = pairs[index];
            if (element === candidate) return candidate;
            if (shouldKeepOrder(element, pair)) {
              break;
            }
          }
        }

        let lastTarget: YAMLPairData | null = null;
        for (let index = pairIndex - 1; index >= 0; index--) {
          const element = pairs[index];
          if (
            option.isValidOrder(pair, element) &&
            !shouldKeepOrder(element, pair)
          ) {
            lastTarget = element;
            continue;
          }
          return lastTarget;
        }
        return lastTarget;
      }
    }

    /**
     * Checks whether the given two properties have a blank line between them.
     */
    function hasBlankLine(prev: YAMLPairData, next: YAMLPairData) {
      const tokenOrNodes = [
        ...sourceCode.getTokensBetween(prev.node as never, next.node as never, {
          includeComments: true,
        }),
        next.node,
      ];
      let prevLoc = prev.node.loc;
      for (const t of tokenOrNodes) {
        const loc = t.loc;
        if (loc.start.line - prevLoc.end.line > 1) {
          return true;
        }
        prevLoc = loc;
      }
      return false;
    }

    type PairStack = {
      upper: PairStack | null;
      anchors: Set<string>;
      aliases: Set<string>;
    };
    let pairStack: PairStack = {
      upper: null,
      anchors: new Set<string>(),
      aliases: new Set<string>(),
    };
    const anchorAliasMap = new Map<
      AST.YAMLPair,
      {
        anchors: Set<string>;
        aliases: Set<string>;
      }
    >();

    return {
      YAMLPair() {
        pairStack = {
          upper: pairStack,
          anchors: new Set<string>(),
          aliases: new Set<string>(),
        };
      },
      YAMLAnchor(node: AST.YAMLAnchor) {
        if (pairStack) {
          pairStack.anchors.add(node.name);
        }
      },
      YAMLAlias(node: AST.YAMLAlias) {
        if (pairStack) {
          pairStack.aliases.add(node.name);
        }
      },
      "YAMLPair:exit"(node: AST.YAMLPair) {
        anchorAliasMap.set(node, pairStack);
        const { anchors, aliases } = pairStack;
        pairStack = pairStack.upper!;
        pairStack.anchors = new Set([...pairStack.anchors, ...anchors]);
        pairStack.aliases = new Set([...pairStack.aliases, ...aliases]);
      },
      "YAMLMapping:exit"(node: AST.YAMLMapping) {
        const data = new YAMLMappingData(node, sourceCode, anchorAliasMap);
        const option = parsedOptions.find((o) => o.isTargetMapping(data));
        if (!option) {
          return;
        }
        for (const pairs of groupingPairs(data.pairs, option)) {
          verifyPairs(pairs, option);
        }
      },
    };

    /**
     * Fix by moving the node after the target node for flow.
     */
    function* fixToMoveDownForFlow(
      fixer: RuleFixer,
      data: YAMLPairData,
      moveTarget: YAMLPairData,
    ) {
      const beforeToken = sourceCode.getTokenBefore(data.node)!;
      let insertCode: string,
        removeRange: AST.Range,
        insertTargetToken: AST.Token | AST.Comment;

      const afterCommaToken = sourceCode.getTokenAfter(data.node);
      if (isComma(afterCommaToken)) {
        // e.g. |/**/ key: value,|
        removeRange = [beforeToken.range[1], afterCommaToken.range[1]];
        const moveTargetAfterToken = sourceCode.getTokenAfter(moveTarget.node)!;
        if (isComma(moveTargetAfterToken)) {
          // e.g. target: value,
          insertTargetToken = moveTargetAfterToken;
          insertCode = sourceCode.text.slice(...removeRange);
        } else {
          // e.g. target: value}
          insertTargetToken = sourceCode.getLastToken(moveTarget.node);
          insertCode = sourceCode.text.slice(
            beforeToken.range[1],
            afterCommaToken.range[0],
          );
          insertCode = `,${insertCode}`;
        }
      } else {
        if (isComma(beforeToken)) {
          // e.g. |,/**/ key: value|
          removeRange = [beforeToken.range[0], data.node.range[1]];
          insertCode = sourceCode.text.slice(...removeRange);
          insertTargetToken = sourceCode.getLastToken(moveTarget.node);
        } else {
          // e.g. |{/**/ key: value|
          removeRange = [beforeToken.range[1], data.node.range[1]];
          insertCode = `,${sourceCode.text.slice(...removeRange)}`;
          insertTargetToken = sourceCode.getLastToken(moveTarget.node);
        }
      }
      yield fixer.removeRange(removeRange);
      yield fixer.insertTextAfterRange(insertTargetToken.range, insertCode);
    }

    /**
     * Fix by moving the node before the target node for flow.
     */
    function* fixToMoveUpForFlow(
      fixer: RuleFixer,
      data: YAMLPairData,
      moveTarget: YAMLPairData,
    ) {
      const beforeCommaToken = sourceCode.getTokenBefore(data.node)!;
      let insertCode: string,
        removeRange: AST.Range,
        insertTargetToken: AST.Token | AST.Comment;

      const afterCommaToken = sourceCode.getTokenAfter(data.node);
      const moveTargetBeforeToken = sourceCode.getTokenBefore(moveTarget.node)!;
      if (isComma(afterCommaToken)) {
        // e.g. |/**/ key: value,|
        removeRange = [beforeCommaToken.range[1], afterCommaToken.range[1]];
        insertCode = sourceCode.text.slice(...removeRange);
        insertTargetToken = moveTargetBeforeToken;
      } else {
        // e.g. |,/**/ key: value|
        removeRange = [beforeCommaToken.range[0], data.node.range[1]];
        if (isComma(moveTargetBeforeToken)) {
          // { a: 1 , target : 2 , c : 3 }
          //       ^ insert
          insertCode = sourceCode.text.slice(...removeRange);
          insertTargetToken = sourceCode.getTokenBefore(moveTargetBeforeToken)!;
        } else {
          // { target: 1 , b : 2 , c : 3 }
          //  ^ insert
          insertCode = `${sourceCode.text.slice(
            beforeCommaToken.range[1],
            data.node.range[1],
          )},`;
          insertTargetToken = moveTargetBeforeToken;
        }
      }
      yield fixer.insertTextAfterRange(insertTargetToken.range, insertCode);

      yield fixer.removeRange(removeRange);
    }

    /**
     * Fix by moving the node after the target node for block.
     */
    function* fixToMoveDownForBlock(
      fixer: RuleFixer,
      data: YAMLPairData,
      moveTarget: YAMLPairData,
    ) {
      const nodeLocs = getPairRangeForBlock(data.node);
      const moveTargetLocs = getPairRangeForBlock(moveTarget.node);

      if (nodeLocs.loc.start.column === 0) {
        const removeRange: AST.Range = [
          getNewlineStartIndex(nodeLocs.range[0]),
          nodeLocs.range[1],
        ];
        const moveTargetRange: AST.Range = [
          getNewlineStartIndex(moveTargetLocs.range[0]),
          moveTargetLocs.range[1],
        ];
        const insertCode = sourceCode.text.slice(...removeRange);
        const isAtFileStart = nodeLocs.loc.start.line === 1;

        if (isAtFileStart) {
          // e.g.
          // | b: 2
          //       ^ trailing newline (will be redundant after move)
          // | a: 1
          // | c: 3

          const removeRangeEnd = nodeLocs.range[1];
          const len = sourceCode.text.length;
          if (removeRangeEnd < len) {
            const ch = sourceCode.text[removeRangeEnd];
            if (isNewLine(ch)) {
              if (
                ch === "\r" &&
                removeRangeEnd + 1 < len &&
                sourceCode.text[removeRangeEnd + 1] === "\n"
              ) {
                removeRange[1] += 2;
              } else {
                removeRange[1] += 1;
              }
            }
          }
        }

        yield fixer.removeRange(removeRange);

        // e.g.
        // | b: 2
        //   ^ no leading newline (prepend upon move)
        // | a: 1
        // | c: 3
        yield fixer.insertTextAfterRange(
          moveTargetRange,
          `${isAtFileStart ? "\n" : ""}${insertCode}`,
        );
      } else {
        // e.g.
        // | - a: 1
        // |   b: 2

        const nextToken = sourceCode.getTokenAfter(data.node, {
          includeComments: true,
        })!;
        // | - a: 1
        //     ^ data.node.range[0]
        // |   b: 2
        //     ^ nextToken
        const removeRange: AST.Range = [data.node.range[0], nextToken.range[0]];
        yield fixer.removeRange(removeRange);

        const indentCode = sourceCode.text
          .slice(
            sourceCode.getIndexFromLoc({
              line: nodeLocs.loc.start.line,
              column: 0,
            }),
            data.node.range[0],
          )
          .replace(/\S/g, " ");
        const insertCode = `\n${indentCode}${sourceCode.text.slice(data.node.range[0], nodeLocs.range[1])}`;
        yield fixer.insertTextAfterRange(moveTargetLocs.range, insertCode);
      }
    }

    /**
     * Fix by moving the node before the target node for block.
     */
    function* fixToMoveUpForBlock(
      fixer: RuleFixer,
      data: YAMLPairData,
      moveTarget: YAMLPairData,
    ) {
      const nodeLocs = getPairRangeForBlock(data.node);
      const moveTargetLocs = getPairRangeForBlock(moveTarget.node);

      if (moveTargetLocs.loc.start.column === 0) {
        const removeRange: AST.Range = [
          getNewlineStartIndex(nodeLocs.range[0]),
          nodeLocs.range[1],
        ];
        const moveTargetRange: AST.Range = [
          getNewlineStartIndex(moveTargetLocs.range[0]),
          moveTargetLocs.range[1],
        ];

        const insertCode = sourceCode.text.slice(...removeRange);
        yield fixer.insertTextBeforeRange(
          moveTargetRange,
          `${insertCode}${moveTargetLocs.loc.start.line === 1 ? "\n" : ""}`,
        );
        yield fixer.removeRange(removeRange);
      } else {
        // e.g.
        // | - a: 1
        // |   b: 2
        const diffIndent = nodeLocs.indentColumn - moveTargetLocs.indentColumn;

        const insertCode = `${sourceCode.text.slice(
          nodeLocs.range[0] + diffIndent,
          nodeLocs.range[1],
        )}\n${sourceCode.text.slice(
          nodeLocs.range[0],
          nodeLocs.range[0] + diffIndent,
        )}`;
        yield fixer.insertTextBeforeRange(moveTargetLocs.range, insertCode);

        const removeRange: AST.Range = [
          getNewlineStartIndex(nodeLocs.range[0]),
          nodeLocs.range[1],
        ];
        yield fixer.removeRange(removeRange);
      }
    }

    /**
     * Get start index of newline
     */
    function getNewlineStartIndex(nextIndex: number): number {
      for (let index = nextIndex; index >= 0; index--) {
        const char = sourceCode.text[index];
        if (isNewLine(sourceCode.text[index])) {
          const prev = sourceCode.text[index - 1];
          if (prev === "\r" && char === "\n") {
            return index - 1;
          }
          return index;
        }
      }
      return 0;
    }

    /**
     * Get range from given pair
     */
    function getPairRangeForBlock(node: AST.YAMLPair): {
      loc: AST.SourceLocation;
      range: AST.Range;
      indentColumn: number;
    } {
      let end: { index: number; loc: AST.Position };
      const afterToken = sourceCode.getTokenAfter(node, {
        includeComments: true,
        filter: (t) =>
          !isCommentToken(t) || node.loc.end.line < t.loc.start.line,
      });
      if (!afterToken || node.loc.end.line < afterToken.loc.start.line) {
        const line = afterToken
          ? afterToken.loc.start.line - 1
          : node.loc.end.line;
        const lineText = sourceCode.lines[line - 1];
        end = {
          loc: { line, column: lineText.length },
          get index() {
            return sourceCode.getIndexFromLoc(this.loc);
          },
        };
      } else {
        end = {
          index: node.range[1],
          loc: node.loc.end,
        };
      }

      const beforeToken = sourceCode.getTokenBefore(node);
      if (beforeToken) {
        const next = sourceCode.getTokenAfter(beforeToken, {
          includeComments: true,
        })!;
        if (
          beforeToken.loc.end.line < next.loc.start.line ||
          beforeToken.loc.end.line < node.loc.start.line
        ) {
          const start = {
            line:
              beforeToken.loc.end.line < next.loc.start.line
                ? next.loc.start.line
                : node.loc.start.line,
            column: 0,
          };
          return {
            range: [sourceCode.getIndexFromLoc(start), end.index],
            loc: { start, end: end.loc },
            indentColumn: next.loc.start.column,
          };
        }
        return {
          range: [beforeToken.range[1], end.index],
          loc: { start: beforeToken.loc.end, end: end.loc },
          indentColumn: node.range[0] - beforeToken.range[1],
        };
      }
      let next: AST.Token | AST.Comment | AST.YAMLPair = node;
      for (const beforeComment of sourceCode
        .getTokensBefore(node, {
          includeComments: true,
        })
        .reverse()) {
        if (beforeComment.loc.end.line + 1 < next.loc.start.line) {
          const start = {
            line: next.loc.start.line,
            column: 0,
          };
          const startOfRange = sourceCode.getIndexFromLoc(start);
          return {
            range: [startOfRange, end.index],
            loc: { start, end: end.loc },
            indentColumn: next.loc.start.column,
          };
        }
        next = beforeComment;
      }
      const start = {
        line: node.loc.start.line,
        column: 0,
      };
      const startOfRange = sourceCode.getIndexFromLoc(start);
      return {
        range: [startOfRange, end.index],
        loc: { start, end: end.loc },
        indentColumn: node.loc.start.column,
      };
    }
  },
});
