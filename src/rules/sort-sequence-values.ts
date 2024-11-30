import type { RuleFixer, SourceCode, YAMLToken } from "../types";
import naturalCompare from "natural-compare";
import { createRule } from "../utils/index";
import { isComma } from "../utils/ast-utils";
import type { AST } from "yaml-eslint-parser";
import { getStaticYAMLValue } from "yaml-eslint-parser";
import { getSourceCode } from "../utils/compat";

type YAMLValue = ReturnType<typeof getStaticYAMLValue>;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

type UserOptions = PatternOption[];
type OrderTypeOption = "asc" | "desc";
type PatternOption = {
  pathPattern: string;
  order:
    | OrderObject
    | (
        | string
        | {
            valuePattern?: string;
            order?: OrderObject;
          }
      )[];
  minValues?: number;
};
type OrderObject = {
  type?: OrderTypeOption;
  caseSensitive?: boolean;
  natural?: boolean;
};
type ParsedOption = {
  isTargetArray: (node: YAMLSequenceData) => boolean;
  ignore: (data: YAMLEntryData) => boolean;
  isValidOrder: Validator;
  orderText: (data: YAMLEntryData) => string;
};
type Validator = (a: YAMLEntryData, b: YAMLEntryData) => boolean;

type YAMLEntry = AST.YAMLSequence["entries"][number];
type AroundTokens = { before: YAMLToken; after: YAMLToken };
class YAMLEntryData {
  public readonly sequence: YAMLSequenceData;

  public readonly node: YAMLEntry;

  public readonly index: number;

  public readonly anchorAlias: {
    anchors: Set<string>;
    aliases: Set<string>;
  };

  private cached: { value: YAMLValue } | null = null;

  private cachedRange: [number, number] | null = null;

  private cachedAroundTokens: AroundTokens | null = null;

  public get reportLoc() {
    if (this.node) {
      return this.node.loc;
    }
    const aroundTokens = this.aroundTokens;
    return {
      start: aroundTokens.before.loc.end,
      end: aroundTokens.after.loc.start,
    };
  }

  public get range(): [number, number] {
    if (this.node) {
      return this.node.range;
    }
    if (this.cachedRange) {
      return this.cachedRange;
    }
    const aroundTokens = this.aroundTokens;
    return (this.cachedRange = [
      aroundTokens.before.range[1],
      aroundTokens.after.range[0],
    ]);
  }

  public get aroundTokens(): AroundTokens {
    if (this.cachedAroundTokens) {
      return this.cachedAroundTokens;
    }
    const sourceCode = this.sequence.sourceCode;
    if (this.node) {
      return (this.cachedAroundTokens = {
        before: sourceCode.getTokenBefore(this.node)!,
        after: sourceCode.getTokenAfter(this.node)!,
      });
    }
    const before =
      this.index > 0
        ? this.sequence.entries[this.index - 1].aroundTokens.after
        : sourceCode.getFirstToken(this.sequence.node);
    const after = sourceCode.getTokenAfter(before)!;
    return (this.cachedAroundTokens = { before, after });
  }

  public constructor(
    sequence: YAMLSequenceData,
    node: YAMLEntry,
    index: number,
    anchorAlias: {
      anchors: Set<string>;
      aliases: Set<string>;
    },
  ) {
    this.sequence = sequence;
    this.node = node;
    this.index = index;
    this.anchorAlias = anchorAlias;
  }

  public get value() {
    return (
      this.cached ??
      (this.cached = {
        value: this.node == null ? null : getStaticYAMLValue(this.node),
      })
    ).value;
  }
}
class YAMLSequenceData {
  public readonly node: AST.YAMLSequence;

  public readonly sourceCode: SourceCode;

  private readonly anchorAliasMap: Map<
    AST.YAMLContent | AST.YAMLWithMeta | null,
    { anchors: Set<string>; aliases: Set<string> }
  >;

  private cachedEntries: YAMLEntryData[] | null = null;

  public constructor(
    node: AST.YAMLSequence,
    sourceCode: SourceCode,
    anchorAliasMap: Map<
      YAMLEntry,
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

  public get entries() {
    return (this.cachedEntries ??= this.node.entries.map(
      (e, index) =>
        new YAMLEntryData(this, e, index, this.anchorAliasMap.get(e)!),
    ));
  }
}

/**
 * Build function which check that the given 2 names are in specific order.
 */
function buildValidatorFromType(
  order: OrderTypeOption,
  insensitive: boolean,
  natural: boolean,
): Validator {
  type Compare<T> = ([a, b]: T[]) => boolean;

  // eslint-disable-next-line func-style -- ignore
  let compareValue: Compare<
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore */
    any
  > = ([a, b]) => a <= b;
  let compareText: Compare<string> = compareValue;

  if (natural) {
    compareText = ([a, b]) => naturalCompare(a, b) <= 0;
  }
  if (insensitive) {
    const baseCompareText = compareText;
    compareText = ([a, b]: string[]) =>
      baseCompareText([a.toLowerCase(), b.toLowerCase()]);
  }
  if (order === "desc") {
    const baseCompareText = compareText;
    compareText = (args: string[]) => baseCompareText(args.reverse());
    const baseCompareValue = compareValue;
    compareValue = (args) => baseCompareValue(args.reverse());
  }
  return (a: YAMLEntryData, b: YAMLEntryData) => {
    if (typeof a.value === "string" && typeof b.value === "string") {
      return compareText([a.value, b.value]);
    }
    const type = getYAMLPrimitiveType(a.value);
    if (type && type === getYAMLPrimitiveType(b.value)) {
      return compareValue([a.value, b.value]);
    }
    // Unknown
    return true;
  };
}

/**
 * Parse options
 */
function parseOptions(
  options: UserOptions,
  sourceCode: SourceCode,
): ParsedOption[] {
  return options.map((opt) => {
    const order = opt.order;
    const pathPattern = new RegExp(opt.pathPattern);
    const minValues: number = opt.minValues ?? 2;
    if (!Array.isArray(order)) {
      const type: OrderTypeOption = order.type ?? "asc";
      const insensitive = order.caseSensitive === false;
      const natural = Boolean(order.natural);

      return {
        isTargetArray,
        ignore: () => false,
        isValidOrder: buildValidatorFromType(type, insensitive, natural),
        orderText(data) {
          if (typeof data.value === "string") {
            return `${natural ? "natural " : ""}${
              insensitive ? "insensitive " : ""
            }${type}ending`;
          }
          return `${type}ending`;
        },
      };
    }
    const parsedOrder: {
      test: (v: YAMLEntryData) => boolean;
      isValidNestOrder: Validator;
    }[] = [];
    for (const o of order) {
      if (typeof o === "string") {
        parsedOrder.push({
          test: (v) => v.value === o,
          isValidNestOrder: () => true,
        });
      } else {
        const valuePattern = o.valuePattern ? new RegExp(o.valuePattern) : null;
        const nestOrder = o.order ?? {};
        const type: OrderTypeOption = nestOrder.type ?? "asc";
        const insensitive = nestOrder.caseSensitive === false;
        const natural = Boolean(nestOrder.natural);
        parsedOrder.push({
          test: (v) =>
            valuePattern
              ? Boolean(getYAMLPrimitiveType(v.value)) &&
                valuePattern.test(String(v.value))
              : true,
          isValidNestOrder: buildValidatorFromType(type, insensitive, natural),
        });
      }
    }

    return {
      isTargetArray,
      ignore: (v) => parsedOrder.every((p) => !p.test(v)),
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
      orderText: () => "specified",
    };

    /**
     * Checks whether given node data is verify target
     */
    function isTargetArray(data: YAMLSequenceData) {
      if (data.node.entries.length < minValues) {
        return false;
      }

      // Check whether the path is match or not.
      let path = "";
      let curr: AST.YAMLNode = data.node;
      let p: AST.YAMLNode | null = curr.parent;
      while (p) {
        if (p.type === "YAMLPair") {
          const name = getPropertyName(p);
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
      return pathPattern.test(path);
    }
  });

  /**
   * Gets the property name of the given `YAMLPair` node.
   */
  function getPropertyName(node: AST.YAMLPair): string {
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
}

/**
 * Get the type name from given value when value is primitive like value
 */
function getYAMLPrimitiveType(val: YAMLValue) {
  const t = typeof val;
  if (t === "string" || t === "number" || t === "boolean" || t === "bigint") {
    return t;
  }
  if (val === null) {
    return "null";
  }
  if (val === undefined) {
    return "undefined";
  }
  if (val instanceof RegExp) {
    return "regexp";
  }
  return null;
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

export default createRule("sort-sequence-values", {
  meta: {
    docs: {
      description: "require sequence values to be sorted",
      categories: null,
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pathPattern: { type: "string" },
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
                        valuePattern: {
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
          minValues: {
            type: "integer",
            minimum: 2,
          },
        },
        required: ["pathPattern", "order"],
        additionalProperties: false,
      },
      minItems: 1,
    },

    messages: {
      sortValues:
        "Expected sequence values to be in {{orderText}} order. '{{thisValue}}' should be before '{{prevValue}}'.",
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
     * Check order
     */
    function isValidOrder(
      prevData: YAMLEntryData,
      thisData: YAMLEntryData,
      option: ParsedOption,
    ) {
      if (option.isValidOrder(prevData, thisData)) {
        return true;
      }

      for (const aliasName of thisData.anchorAlias.aliases) {
        if (prevData.anchorAlias.anchors.has(aliasName)) {
          // The current order is correct for handling anchors.
          return true;
        }
      }
      for (const anchorName of thisData.anchorAlias.anchors) {
        if (prevData.anchorAlias.aliases.has(anchorName)) {
          // The current order is correct for handling anchors.
          return true;
        }
      }
      return false;
    }

    /**
     * Verify for sequence entries
     */
    function verifyArrayElement(data: YAMLEntryData, option: ParsedOption) {
      if (option.ignore(data)) {
        return;
      }
      const prevList = data.sequence.entries
        .slice(0, data.index)
        .reverse()
        .filter((d) => !option.ignore(d));

      if (prevList.length === 0) {
        return;
      }
      const prev = prevList[0];
      if (!isValidOrder(prev, data, option)) {
        const reportLoc = data.reportLoc;
        context.report({
          loc: reportLoc,
          messageId: "sortValues",
          data: {
            thisValue: toText(data),
            prevValue: toText(prev),
            orderText: option.orderText(data),
          },
          *fix(fixer) {
            let moveTarget = prevList[0];
            for (const prev of prevList) {
              if (isValidOrder(prev, data, option)) {
                break;
              } else {
                moveTarget = prev;
              }
            }
            if (data.sequence.node.style === "flow") {
              yield* fixForFlow(fixer, data, moveTarget);
            } else {
              yield* fixForBlock(fixer, data, moveTarget);
            }
          },
        });
      }
    }

    /**
     * Convert to display text.
     */
    function toText(data: YAMLEntryData) {
      if (getYAMLPrimitiveType(data.value)) {
        return String(data.value);
      }
      return sourceCode.getText(data.node!);
    }

    type EntryStack = {
      upper: EntryStack | null;
      anchors: Set<string>;
      aliases: Set<string>;
    };
    let entryStack: EntryStack = {
      upper: null,
      anchors: new Set<string>(),
      aliases: new Set<string>(),
    };
    const anchorAliasMap = new Map<
      YAMLEntry,
      {
        anchors: Set<string>;
        aliases: Set<string>;
      }
    >();

    return {
      "YAMLSequence > *"(node: YAMLEntry & { parent: AST.YAMLSequence }) {
        if (!node.parent.entries.includes(node)) {
          return;
        }
        entryStack = {
          upper: entryStack,
          anchors: new Set<string>(),
          aliases: new Set<string>(),
        };
        if (node.type === "YAMLAlias") {
          entryStack.aliases.add(node.name);
        }
      },
      YAMLAnchor(node: AST.YAMLAnchor) {
        if (entryStack) {
          entryStack.anchors.add(node.name);
        }
      },
      YAMLAlias(node: AST.YAMLAlias) {
        if (entryStack) {
          entryStack.aliases.add(node.name);
        }
      },
      "YAMLSequence > *:exit"(node: YAMLEntry & { parent: AST.YAMLSequence }) {
        if (!node.parent.entries.includes(node)) {
          return;
        }
        anchorAliasMap.set(node, entryStack);
        const { anchors, aliases } = entryStack;
        entryStack = entryStack.upper!;
        entryStack.anchors = new Set([...entryStack.anchors, ...anchors]);
        entryStack.aliases = new Set([...entryStack.aliases, ...aliases]);
      },
      "YAMLSequence:exit"(node: AST.YAMLSequence) {
        const data = new YAMLSequenceData(node, sourceCode, anchorAliasMap);
        const option = parsedOptions.find((o) => o.isTargetArray(data));
        if (!option) {
          return;
        }
        for (const element of data.entries) {
          verifyArrayElement(element, option);
        }
      },
    };

    /**
     * Fix for flow
     */
    function* fixForFlow(
      fixer: RuleFixer,
      data: YAMLEntryData,
      moveTarget: YAMLEntryData,
    ) {
      const beforeToken = data.aroundTokens.before;
      const afterToken = data.aroundTokens.after;
      let insertCode: string,
        removeRange: AST.Range,
        insertTargetToken: YAMLToken;
      if (isComma(afterToken)) {
        // e.g. |# comment\n value,|
        removeRange = [beforeToken.range[1], afterToken.range[1]];
        insertCode = sourceCode.text.slice(...removeRange);
        insertTargetToken = moveTarget.aroundTokens.before;
      } else {
        // e.g. |, # comment\n value|
        removeRange = [beforeToken.range[0], data.range[1]];
        if (isComma(moveTarget.aroundTokens.before)) {
          // [ a , target ]
          //    ^ insert
          insertCode = sourceCode.text.slice(...removeRange);
          insertTargetToken = sourceCode.getTokenBefore(
            moveTarget.aroundTokens.before,
          )!;
        } else {
          // [ target ]
          //  ^ insert
          insertCode = `${sourceCode.text.slice(
            beforeToken.range[1],
            data.range[1],
          )},`;
          insertTargetToken = moveTarget.aroundTokens.before;
        }
      }
      yield fixer.insertTextAfterRange(insertTargetToken.range, insertCode);

      yield fixer.removeRange(removeRange);
    }

    /**
     * Fix for block
     */
    function* fixForBlock(
      fixer: RuleFixer,
      data: YAMLEntryData,
      moveTarget: YAMLEntryData,
    ) {
      const moveDataList = data.sequence.entries.slice(
        moveTarget.index,
        data.index + 1,
      );

      let replacementCodeRange = getBlockEntryRange(data);
      for (const target of moveDataList) {
        const range = getBlockEntryRange(target);
        yield fixer.replaceTextRange(
          range,
          sourceCode.text.slice(...replacementCodeRange),
        );
        replacementCodeRange = range;
      }
    }

    /**
     * Get range of entry
     */
    function getBlockEntryRange(data: YAMLEntryData): AST.Range {
      return [getBlockEntryStartOffset(data), getBlockEntryEndOffset(data)];
    }

    /**
     * Get start offset of entry
     */
    function getBlockEntryStartOffset(data: YAMLEntryData) {
      const beforeHyphenToken = sourceCode.getTokenBefore(
        data.aroundTokens.before,
      );
      if (!beforeHyphenToken) {
        const comment = sourceCode.getTokenBefore(data.aroundTokens.before, {
          includeComments: true,
        });
        if (
          comment &&
          data.aroundTokens.before.loc.start.column <= comment.loc.start.column
        ) {
          return comment.range[0];
        }

        return data.aroundTokens.before.range[0];
      }
      let next = sourceCode.getTokenAfter(beforeHyphenToken, {
        includeComments: true,
      })!;
      while (
        beforeHyphenToken.loc.end.line === next.loc.start.line &&
        next.range[1] < data.aroundTokens.before.range[0]
      ) {
        next = sourceCode.getTokenAfter(next, {
          includeComments: true,
        })!;
      }
      return next.range[0];
    }

    /**
     * Get start offset of entry
     */
    function getBlockEntryEndOffset(data: YAMLEntryData) {
      const valueEndToken = data.node ?? data.aroundTokens.before;
      let last = valueEndToken;
      let afterToken = sourceCode.getTokenAfter(last, {
        includeComments: true,
      });
      while (
        afterToken &&
        valueEndToken.loc.end.line === afterToken.loc.start.line
      ) {
        last = afterToken;
        afterToken = sourceCode.getTokenAfter(last, {
          includeComments: true,
        });
      }
      return last.range[1];
    }
  },
});
