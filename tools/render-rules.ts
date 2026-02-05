import type { RuleModule } from "../src/types.ts";
import { rules } from "../src/utils/rules.ts";

//eslint-disable-next-line jsdoc/require-jsdoc -- tool
export default function renderRulesTableContent(
  categoryLevel: number,
  buildRulePath = (ruleName: string) => `./${ruleName}.md`,
): string {
  const pluginRules = rules.filter(
    (rule) => !rule.meta.deprecated && !rule.meta.docs.extensionRule,
  );
  const extensionRules = rules.filter(
    (rule) => !rule.meta.deprecated && rule.meta.docs.extensionRule,
  );

  const deprecatedRules = rules.filter((rule) => rule.meta.deprecated);

  // -----------------------------------------------------------------------------

  //eslint-disable-next-line jsdoc/require-jsdoc -- tool
  function toRuleRow(rule: RuleModule) {
    const fixableMark = rule.meta.fixable ? ":wrench:" : "";
    const recommendedMark =
      rule.meta.docs.categories &&
      rule.meta.docs.categories.includes("recommended")
        ? ":star:"
        : "";
    const standardMark =
      rule.meta.docs.categories &&
      rule.meta.docs.categories.includes("standard")
        ? ":star:"
        : "";
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || "",
    )})`;
    const description = rule.meta.docs.description || "(no description)";

    return `| ${link} | ${description} | ${fixableMark} | ${recommendedMark} | ${standardMark} |`;
  }

  //eslint-disable-next-line jsdoc/require-jsdoc -- tool
  function toDeprecatedRuleRow(rule: RuleModule) {
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || "",
    )})`;
    const replacedRules = rule.meta.replacedBy || [];
    const replacedBy = replacedRules
      .map((name) => `[yml/${name}](${buildRulePath(name)}.md)`)
      .join(", ");

    return `| ${link} | ${replacedBy || "(no replacement)"} |`;
  }

  // -----------------------------------------------------------------------------
  let rulesTableContent = `
#${"#".repeat(categoryLevel)} YAML Rules

| Rule ID | Description | Fixable | RECOMMENDED | STANDARD |
|:--------|:------------|:-------:|:-----------:|:--------:|
${pluginRules.map(toRuleRow).join("\n")}

#${"#".repeat(categoryLevel)} Extension Rules

| Rule ID | Description | Fixable | RECOMMENDED | STANDARD |
|:--------|:------------|:-------:|:-----------:|:--------:|
${extensionRules.map(toRuleRow).join("\n")}
`;

  // -----------------------------------------------------------------------------
  if (deprecatedRules.length >= 1) {
    rulesTableContent += `
## Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join("\n")}
`;
  }
  return rulesTableContent;
}
