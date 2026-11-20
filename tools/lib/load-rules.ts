import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import type { RuleModule } from "../../src/types.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
async function readRules() {
  const rules: RuleModule[] = [];
  const rulesLibRoot = path.resolve(dirname, "../../src/rules");
  for (const name of fs
    .readdirSync(rulesLibRoot)
    .filter((n) => n.endsWith(".ts"))) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `yml/${ruleName}`;
    const module = await import(path.join(rulesLibRoot, name));
    const rule = module.default;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  const vueCustomBlockRulesLibRoot = path.resolve(
    dirname,
    "../../src/rules/vue-custom-block",
  );
  for (const name of fs.readdirSync(vueCustomBlockRulesLibRoot)) {
    const ruleName = `vue-custom-block/${name.replace(/\.ts$/u, "")}`;
    const ruleId = `yml/${ruleName}`;
    const module = await import(path.join(vueCustomBlockRulesLibRoot, name));
    const rule = module.default;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  return rules;
}

export const rules = await readRules();
