import assert from "node:assert";
import plugin from "../../../src/index.ts";
import base from "../../../src/configs/flat/base.ts";
import recommended from "../../../src/configs/flat/recommended.ts";
import standard from "../../../src/configs/flat/standard.ts";
import prettier from "../../../src/configs/flat/prettier.ts";
import { defineConfig } from "eslint/config";
import type { Linter } from "eslint";
import ts from "typescript";

describe("exactOptionalPropertyTypes compatibility", () => {
  it("flat configs are assignable to Linter.Config[]", () => {
    const _base: Linter.Config[] = base;
    const _rec: Linter.Config[] = recommended;
    const _std: Linter.Config[] = standard;
    const _pre: Linter.Config[] = prettier;

    const _cfgBase: Linter.Config[] = plugin.configs.base;
    const _cfgRec: Linter.Config[] = plugin.configs.recommended;
    const _cfgStd: Linter.Config[] = plugin.configs.standard;
    const _cfgPre: Linter.Config[] = plugin.configs.prettier;

    const _cfgFlatBase: Linter.Config[] = plugin.configs["flat/base"];
    const _cfgFlatRec: Linter.Config[] = plugin.configs["flat/recommended"];
    const _cfgFlatStd: Linter.Config[] = plugin.configs["flat/standard"];
    const _cfgFlatPre: Linter.Config[] = plugin.configs["flat/prettier"];

    assert.ok(
      _base &&
        _rec &&
        _std &&
        _pre &&
        _cfgBase &&
        _cfgRec &&
        _cfgStd &&
        _cfgPre &&
        _cfgFlatBase &&
        _cfgFlatRec &&
        _cfgFlatStd &&
        _cfgFlatPre,
    );
  });

  it("flat configs can be passed to defineConfig without type errors", () => {
    const config = defineConfig({
      extends: [
        plugin.configs.base,
        plugin.configs.recommended,
        plugin.configs.standard,
        plugin.configs.prettier,
        plugin.configs["flat/base"],
        plugin.configs["flat/recommended"],
        plugin.configs["flat/standard"],
        plugin.configs["flat/prettier"],
        base,
        recommended,
        standard,
        prettier,
      ],
      files: ["**/*.{yml,yaml}"],
      rules: {
        "yml/file-extension": "error",
      },
    });

    assert.ok(Array.isArray(config));
  });

  it("compiles cleanly under TypeScript exactOptionalPropertyTypes", () => {
    const source = `
import { defineConfig } from "eslint/config";
import plugin from "./src/index.js";
import base from "./src/configs/flat/base.js";
import recommended from "./src/configs/flat/recommended.js";
import standard from "./src/configs/flat/standard.js";
import prettier from "./src/configs/flat/prettier.js";

export default defineConfig({
  extends: [
    plugin.configs.base,
    plugin.configs.recommended,
    plugin.configs.standard,
    plugin.configs.prettier,
    plugin.configs["flat/base"],
    plugin.configs["flat/recommended"],
    plugin.configs["flat/standard"],
    plugin.configs["flat/prettier"],
    base,
    recommended,
    standard,
    prettier,
  ],
  files: ["**/*.{yml,yaml}"],
  rules: {
    "yml/file-extension": "error",
  },
});
`;

    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      exactOptionalPropertyTypes: true,
      noEmit: true,
      skipLibCheck: false,
    };

    const host = ts.createCompilerHost(compilerOptions);
    const originalGetSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (fileName, languageVersion) => {
      if (fileName === "test-exact-optional.ts") {
        return ts.createSourceFile(fileName, source, languageVersion);
      }
      return originalGetSourceFile(fileName, languageVersion);
    };

    const program = ts.createProgram(
      ["test-exact-optional.ts"],
      compilerOptions,
      host,
    );
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.file && d.file.fileName === "test-exact-optional.ts");

    assert.strictEqual(
      diagnostics.length,
      0,
      diagnostics
        .map((d) =>
          ts.formatDiagnostic(d, {
            getCurrentDirectory: () => process.cwd(),
            getCanonicalFileName: (f) => f,
            getNewLine: () => "\n",
          }),
        )
        .join("\n"),
    );
  });
});
