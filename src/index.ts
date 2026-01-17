import type { Linter } from "eslint";
import type { RuleDefinition } from "@eslint/core";
import type { RuleModule } from "./types.js";
import { rules as ruleList } from "./utils/rules.js";
import base from "./configs/flat/base.js";
import recommended from "./configs/flat/recommended.js";
import standard from "./configs/flat/standard.js";
import prettier from "./configs/flat/prettier.js";
import * as meta from "./meta.js";
import type { YAMLSourceCode, YAMLLanguageOptions } from "./language/index.js";
import { YAMLLanguage } from "./language/index.js";

const configs = {
  base: base as Linter.Config[],
  recommended: recommended as Linter.Config[],
  standard: standard as Linter.Config[],
  prettier: prettier as Linter.Config[],
  // Keep flat/* for backward compatibility
  "flat/base": base as Linter.Config[],
  "flat/recommended": recommended as Linter.Config[],
  "flat/standard": standard as Linter.Config[],
  "flat/prettier": prettier as Linter.Config[],
};

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
) as Record<string, RuleDefinition>;

const languages = {
  yaml: new YAMLLanguage(),
};

export type { YAMLLanguageOptions, YAMLSourceCode };
export { meta, configs, rules, languages };
export default { meta, configs, rules, languages };
