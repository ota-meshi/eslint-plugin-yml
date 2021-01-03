import path from "path"
import fs from "fs"
import cp from "child_process"
const logger = console

// main
;((ruleId) => {
    if (ruleId == null) {
        logger.error("Usage: npm run new <RuleID>")
        process.exitCode = 1
        return
    }
    if (!/^[\w-]+$/u.test(ruleId)) {
        logger.error("Invalid RuleID '%s'.", ruleId)
        process.exitCode = 1
        return
    }

    const ruleFile = path.resolve(__dirname, `../src/rules/${ruleId}.ts`)
    const testFile = path.resolve(__dirname, `../tests/src/rules/${ruleId}.ts`)
    const fixturesRoot = path.resolve(
        __dirname,
        `../tests/fixtures/rules/${ruleId}/`,
    )
    const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`)
    try {
        fs.mkdirSync(fixturesRoot)
        fs.mkdirSync(path.resolve(fixturesRoot, "valid"))
        fs.mkdirSync(path.resolve(fixturesRoot, "invalid"))
    } catch {
        // ignore
    }

    fs.writeFileSync(
        ruleFile,
        `
import type { AST } from "yaml-eslint-parser"
import { createRule, defineWrapperListener, getCoreRule } from "../utils"
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
        const sourceCode = context.getSourceCode()
        if (!context.parserServices.isYAML) {
            return {}
        }

        return defineWrapperListener(coreRule, context, {
            options: context.options,
        })
    },
})
`,
    )
    fs.writeFileSync(
        testFile,
        `import { RuleTester } from "eslint"
import rule from "../../../src/rules/${ruleId}"
import { loadTestCases, makeSuiteTests } from "../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

// TODO Delete when it are done.
makeSuiteTests("${ruleId}", {
    default: [],
    // never: ["never"],
    // always: ["always"],
})

tester.run("${ruleId}", rule as any, loadTestCases("${ruleId}"))
`,
    )
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
"GOOD": "foo",

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
    )

    cp.execSync(`code "${ruleFile}"`)
    cp.execSync(`code "${testFile}"`)
    cp.execSync(`code "${docFile}"`)
})(process.argv[2])
