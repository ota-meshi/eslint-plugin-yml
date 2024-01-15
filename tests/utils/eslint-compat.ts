import { ESLint as OriginalESLint } from "eslint";
import { getRuleTester } from "eslint-compat-utils/rule-tester";

// eslint-disable-next-line @typescript-eslint/naming-convention -- class name
export const RuleTester = getRuleTester();

// eslint-disable-next-line @typescript-eslint/naming-convention -- class name
export const LegacyESLint: typeof OriginalESLint =
  getUnsupported().LegacyESLint || OriginalESLint;

function getUnsupported() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
    return require("eslint/use-at-your-own-risk");
  } catch {
    return {};
  }
}
