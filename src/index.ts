import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import base from "./configs/base";
import recommended from "./configs/recommended";
import standard from "./configs/standard";
import prettier from "./configs/prettier";
import flatBase from "./configs/base";
import flatRecommended from "./configs/flat/recommended";
import flatStandard from "./configs/flat/standard";
import flatPrettier from "./configs/flat/prettier";
import * as meta from "./meta";

const configs = {
  base,
  recommended,
  standard,
  prettier,
  "flat/base": flatBase,
  "flat/recommended": flatRecommended,
  "flat/standard": flatStandard,
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
