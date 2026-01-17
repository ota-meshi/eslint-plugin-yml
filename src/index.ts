import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import base from "./configs/flat/base";
import recommended from "./configs/flat/recommended";
import standard from "./configs/flat/standard";
import prettier from "./configs/flat/prettier";
import * as meta from "./meta";

const configs = {
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

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
);

const plugin = { meta, configs, rules };

export { meta, configs, rules };
export default plugin;
