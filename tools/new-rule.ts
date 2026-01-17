import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cp from "child_process";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const logger = console;

// main
((ruleId) => {
  if (ruleId == null) {
    logger.error("Usage: npm run new <RuleID>");
    process.exitCode = 1;
    return;
  }
  if (!/^[\w-]+$/u.test(ruleId)) {
    logger.error("Invalid RuleID '%s'.", ruleId);
    process.exitCode = 1;
    return;
  }

  const ruleFile = path.resolve(dirname, `../src/rules/${ruleId}.ts`);
  const testFile = path.resolve(dirname, `../tests/src/rules/${ruleId}.ts`);
  const fixturesRoot = path.resolve(
    dirname,
    `../tests/fixtures/rules/${ruleId}/`,
  );
  const docFile = path.resolve(dirname, `../docs/rules/${ruleId}.md`);
  try {
    fs.mkdirSync(fixturesRoot);
    fs.mkdirSync(path.resolve(fixturesRoot, "valid"));
    fs.mkdirSync(path.resolve(fixturesRoot, "invalid"));
  } catch {
    // ignore
  }

  fs.writeFileSync(
    ruleFile,
    `
import type { AST } from "yaml-eslint-parser"
import { getSourceCode } from "../utils/compat";
import { createRule, defineWrapperListener, getCoreRule } from "../utils/index"
const coreRule = getCoreRule("${ruleId}")
import {
    hasTabIndent,
} from "../utils/yaml"

export default createRule("${ruleId}", {
    meta: {
        docs: {
            description: "...",
            categories: ["..."],
        },
        fixable: coreRule.meta!.fixable,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        const sourceCode = getSourceCode(context)
        if (!sourceCode.parserServices?.isYAML) {
            return {}
        }

        return defineWrapperListener(coreRule, context, {
            options: context.options,
        })
    },
})
`,
  );
  fs.writeFileSync(
    testFile,
    `import { RuleTester } from "../../utils/eslint-compat";
import rule from "../../../src/rules/${ruleId}"
import { loadTestCases } from "../../utils/utils";
import * as yamlESLintParser from "yaml-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: yamlESLintParser,
    ecmaVersion: 2020,
  },
});

// TODO Delete when it are done.
makeSuiteTests("${ruleId}", {
    default: [],
    // never: ["never"],
    // always: ["always"],
})

tester.run("${ruleId}", rule as any, loadTestCases("${ruleId}"))
`,
  );
  fs.writeFileSync(
    docFile,
    `#  (yml/${ruleId})

> description

## :book: Rule Details

This rule reports ???.


<eslint-code-block fix>

<!-- eslint-skip -->

\`\`\`yaml
# eslint yml/${ruleId}: 'error'

# ✓ GOOD
"GOOD": "foo"

# ✗ BAD
"BAD": "bar"
\`\`\`

</eslint-code-block>

## :wrench: Options

Nothing.

\`\`\`yaml
"yml/${ruleId}":
  - "error"
  - "opt"
\`\`\`

Same as [${ruleId}] rule option. See [here](https://eslint.org/docs/rules/${ruleId}#options) for details. 

- 

## :books: Further reading

- 

## :couple: Related rules

- [${ruleId}]

[${ruleId}]: https://eslint.org/docs/rules/${ruleId}

`,
  );

  cp.execSync(`code "${ruleFile}"`);
  cp.execSync(`code "${testFile}"`);
  cp.execSync(`code "${docFile}"`);
  // eslint-disable-next-line no-console -- log
  console.log(
    `npm run mocha -- "tests/src/**/${ruleId}.ts" --reporter dot --timeout 60000`,
  );
})(process.argv[2]);
