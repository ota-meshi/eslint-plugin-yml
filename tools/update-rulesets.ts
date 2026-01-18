import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
// import eslint from "eslint"
import { rules } from "./lib/load-rules";
import type { RuleModule } from "../src/types";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const isWin = os.platform().startsWith("win");

const CONFIGS = {
  recommended: {
    filter(rule: RuleModule) {
      return (
        rule.meta.docs.categories &&
        !rule.meta.deprecated &&
        rule.meta.docs.categories.includes("recommended")
      );
    },
    option(rule: RuleModule) {
      return rule.meta.docs.default || "error";
    },
    config: "recommended",
  },
  standard: {
    filter(rule: RuleModule) {
      return (
        rule.meta.docs.categories &&
        !rule.meta.deprecated &&
        rule.meta.docs.categories.includes("standard")
      );
    },
    option(rule: RuleModule) {
      return rule.meta.docs.default || "error";
    },
    config: "standard",
  },
  prettier: {
    filter(rule: RuleModule) {
      return rule.meta.docs.layout;
    },
    option(_rule: RuleModule) {
      return "off";
    },
    config: "prettier",
  },
};

// Legacy configs are no longer generated or used

for (const rec of ["recommended", "standard", "prettier"] as const) {
  let content = `// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { Linter } from "eslint";
import base from "./base";
export default [
  ...base,
  {
    rules: {
      // eslint-plugin-yml rules
      ${rules
        .filter(CONFIGS[rec].filter)
        .map((rule) => {
          return `"${rule.meta.docs.ruleId}": "${CONFIGS[rec].option(rule)}"`;
        })
        .join(",\n      ")}
    },
  },
] satisfies Linter.Config[];
`;

  const filePath = path.resolve(
    dirname,
    `../src/configs/flat/${CONFIGS[rec].config}.ts`,
  );

  if (isWin) {
    content = content
      .replace(/\r?\n/gu, "\n")
      .replace(/\r/gu, "\n")
      .replace(/\n/gu, "\r\n");
  }

  // Update file.
  fs.writeFileSync(filePath, content);
}
