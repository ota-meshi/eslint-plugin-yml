import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import base from "./configs/base";
import recommended from "./configs/recommended";
import standard from "./configs/standard";
import prettier from "./configs/prettier";
import * as meta from "./meta";

const configs = {
  base,
  recommended,
  standard,
  prettier,
};

const rules = ruleList.reduce((obj, r) => {
  obj[r.meta.docs.ruleName] = r;
  return obj;
}, {} as { [key: string]: RuleModule });

export = {
  meta,
  configs,
  rules,
};
