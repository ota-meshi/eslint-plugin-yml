import type { Linter } from "eslint";
import type { RuleDefinition } from "@eslint/core";
import { rules as ruleList } from "./utils/rules.js";
import base from "./configs/flat/base.js";
import recommended from "./configs/flat/recommended.js";
import standard from "./configs/flat/standard.js";
import prettier from "./configs/flat/prettier.js";
import * as meta from "./meta.js";
import type { YAMLSourceCode, YAMLLanguageOptions } from "./language/index.js";
import { YAMLLanguage } from "./language/index.js";

const configs: {
  base: Linter.Config[];
  recommended: Linter.Config[];
  standard: Linter.Config[];
  prettier: Linter.Config[];
  // Keep flat/* for backward compatibility
  "flat/base": Linter.Config[];
  "flat/recommended": Linter.Config[];
  "flat/standard": Linter.Config[];
  "flat/prettier": Linter.Config[];
} = {
  base,
  recommended,
  standard,
  prettier,
  // Keep flat/* for backward compatibility
  "flat/base": base,
  "flat/recommended": recommended,
  "flat/standard": standard,
  "flat/prettier": prettier,
};

const rules = Object.fromEntries(
  ruleList.map((r) => [r.meta.docs.ruleName, r]),
) as Record<string, RuleDefinition>;

const languages = {
  yaml: new YAMLLanguage(),
};

export type { YAMLLanguageOptions, YAMLSourceCode };
export { meta, configs, rules, languages };
export default { meta, configs, rules, languages };
