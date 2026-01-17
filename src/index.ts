import type { RuleModule } from "./types.js";
import { rules as ruleList } from "./utils/rules.js";
import base from "./configs/flat/base.js";
import recommended from "./configs/flat/recommended.js";
import standard from "./configs/flat/standard.js";
import prettier from "./configs/flat/prettier.js";
import pkg from "../package.json" with { type: "json" };

const meta = {
  name: pkg.name,
  version: pkg.version,
};

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
