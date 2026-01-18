/* eslint @typescript-eslint/naming-convention: off, @typescript-eslint/no-explicit-any: off -- for type */
import type { JSONSchema4 } from "json-schema";
import type * as core from "@eslint/core";
import type { AST } from "yaml-eslint-parser";
import type { YAMLLanguageOptions, YAMLSourceCode } from "./language";
export interface RuleListener {
  YAMLDocument?: (node: AST.YAMLDocument) => void;
  "YAMLDocument:exit"?: (node: AST.YAMLDocument) => void;
  YAMLDirective?: (node: AST.YAMLDirective) => void;
  "YAMLDirective:exit"?: (node: AST.YAMLDirective) => void;
  YAMLAnchor?: (node: AST.YAMLAnchor) => void;
  "YAMLAnchor:exit"?: (node: AST.YAMLAnchor) => void;
  YAMLTag?: (node: AST.YAMLTag) => void;
  "YAMLTag:exit"?: (node: AST.YAMLTag) => void;
  YAMLMapping?: (node: AST.YAMLMapping) => void;
  "YAMLMapping:exit"?: (node: AST.YAMLMapping) => void;
  YAMLPair?: (node: AST.YAMLPair) => void;
  "YAMLPair:exit"?: (node: AST.YAMLPair) => void;
  YAMLSequence?: (node: AST.YAMLSequence) => void;
  "YAMLSequence:exit"?: (node: AST.YAMLSequence) => void;
  YAMLScalar?: (node: AST.YAMLScalar) => void;
  "YAMLScalar:exit"?: (node: AST.YAMLScalar) => void;
  YAMLAlias?: (node: AST.YAMLAlias) => void;
  "YAMLAlias:exit"?: (node: AST.YAMLAlias) => void;
  YAMLWithMeta?: (node: AST.YAMLWithMeta) => void;
  "YAMLWithMeta:exit"?: (node: AST.YAMLWithMeta) => void;
  Program?: (node: AST.YAMLProgram) => void;
  "Program:exit"?: (node: AST.YAMLProgram) => void;

  [key: string]: ((...args: any[]) => void) | undefined;
}

export interface RuleModule extends core.RuleDefinition<{
  LangOptions: YAMLLanguageOptions;
  Code: YAMLSourceCode;
  RuleOptions: unknown[];
  Visitor: RuleListener;
  Node: AST.YAMLNode;
  MessageIds: string;
  ExtRuleDocs: RuleMetaDocs;
}> {
  meta: RuleMetaData;
}

export type RuleMetaDocs = {
  description: string;
  categories: ("recommended" | "standard")[] | null;
  url: string;
  ruleId: string;
  ruleName: string;
  default?: "error" | "warn";
  extensionRule: string | false;
  layout: boolean;
};
export interface RuleMetaData extends core.RulesMeta<
  string,
  unknown[],
  RuleMetaDocs
> {
  docs: RuleMetaDocs;
}

export interface PartialRuleModule {
  meta: PartialRuleMetaData;
  create(context: RuleContext, params: { customBlock: boolean }): RuleListener;
}

export interface PartialRuleMetaData {
  docs: {
    description: string;
    categories: ("recommended" | "standard")[] | null;
    replacedBy?: [];
    default?: "error" | "warn";
    extensionRule: string | false;
    layout: boolean;
  };
  messages: Record<string, string>;
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  schema: JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  type: "problem" | "suggestion" | "layout";
}

export type YMLSettings = { indent?: number };
export type ESLintSettings = null | undefined | { yml?: YMLSettings };

export type RuleContext = core.RuleContext<{
  LangOptions: YAMLLanguageOptions;
  Code: YAMLSourceCode;
  RuleOptions: any[];
  Node: YAMLNodeOrToken;
  MessageIds: string;
}>;

export type YAMLToken = AST.Token | AST.Comment;
export type YAMLNodeOrToken = AST.YAMLNode | YAMLToken;
