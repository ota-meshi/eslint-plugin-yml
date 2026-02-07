/**
 * @fileoverview The YAML language implementation for ESLint.
 */
import type { Language, File, OkParseResult } from "@eslint/core";
import { parseYAML } from "yaml-eslint-parser";
import { VisitorKeys } from "yaml-eslint-parser";
import type { AST } from "yaml-eslint-parser";
import { YAMLSourceCode } from "./yaml-source-code.js";

/**
 * Parse result
 */
interface YAMLParseResult {
  ok: true;
  ast: AST.YAMLProgram;
}

/**
 * Language options for YAML
 */
export type YAMLLanguageOptions = {
  parserOptions?: {
    defaultYAMLVersion?: "1.1" | "1.2";
  };
};

/**
 * The YAML language implementation for ESLint.
 */
export class YAMLLanguage implements Language<{
  LangOptions: YAMLLanguageOptions;
  Code: YAMLSourceCode;
  RootNode: AST.YAMLProgram;
  Node: AST.YAMLNode;
}> {
  /**
   * The type of file to read.
   */
  public fileType = "text" as const;

  /**
   * The line number at which the parser starts counting.
   */
  public lineStart = 1 as const;

  /**
   * The column number at which the parser starts counting.
   */
  public columnStart = 0 as const;

  /**
   * The name of the key that holds the type of the node.
   */
  public nodeTypeKey = "type" as const;

  /**
   * Validates the language options.
   */
  public validateLanguageOptions(_languageOptions: YAMLLanguageOptions): void {
    // Currently no validation needed
  }

  public normalizeLanguageOptions(
    languageOptions: YAMLLanguageOptions,
  ): YAMLLanguageOptions {
    const fakeProperties: Record<string, unknown> = {
      ecmaVersion: "latest",
    };
    return {
      ...languageOptions,
      parserOptions: {
        ...languageOptions.parserOptions,
      },
      ...fakeProperties,
    };
  }

  /**
   * Parses the given file into an AST.
   */
  public parse(
    file: File,
    context: { languageOptions?: YAMLLanguageOptions },
  ): OkParseResult<AST.YAMLProgram> | YAMLParseResult {
    // Note: BOM already removed
    const text = file.body as string;

    const ast = parseYAML(text, {
      filePath: file.path,
      defaultYAMLVersion:
        context.languageOptions?.parserOptions?.defaultYAMLVersion,
    });

    return {
      ok: true,
      ast,
    };
  }

  /**
   * Creates a new SourceCode object for the given file and parse result.
   */
  public createSourceCode(
    file: File,
    parseResult: OkParseResult<AST.YAMLProgram> | YAMLParseResult,
  ): YAMLSourceCode {
    return new YAMLSourceCode({
      text: file.body as string,
      ast: parseResult.ast,
      hasBOM: file.bom,
      parserServices: { isYAML: true },
      visitorKeys: VisitorKeys,
    });
  }
}
