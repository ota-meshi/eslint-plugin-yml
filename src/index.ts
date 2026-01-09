import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import base from "./configs/base";
import recommended from "./configs/recommended";
import standard from "./configs/standard";
import stylistic from "./configs/stylistic";
import prettier from "./configs/prettier";
import flatBase from "./configs/flat/base";
import flatRecommended from "./configs/flat/recommended";
import flatStandard from "./configs/flat/standard";
import flatStylistic from "./configs/flat/stylistic";
import flatPrettier from "./configs/flat/prettier";
import * as meta from "./meta";

const configs = {
  base,
  recommended,
  standard,
  stylistic,
  prettier,
  "flat/base": flatBase,
  "flat/recommended": flatRecommended,
  "flat/standard": flatStandard,
  "flat/stylistic": flatStylistic,
  "flat/prettier": flatPrettier,
};

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
);

export = {
  meta,
  configs,
  rules,
};
