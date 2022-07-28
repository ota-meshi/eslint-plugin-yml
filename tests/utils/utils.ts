import fs from "fs"
import path from "path"
import assert from "assert"
import type { RuleTester } from "eslint"
import { Linter } from "eslint"
import * as yamlESLintParser from "yaml-eslint-parser"
import * as vueESLintParser from "vue-eslint-parser"
// eslint-disable-next-line @typescript-eslint/no-require-imports -- tests
import plugin = require("../../src/index")
import type { YMLSettings } from "../../src/types"
import { applyFixes } from "./apply-fixer"

/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 */
export function unIndent(strings: readonly string[]): string {
    const templateValue = strings[0]
    const lines = templateValue.split("\n")
    const minLineIndent = getMinIndent(lines)

    return lines.map((line) => line.slice(minLineIndent)).join("\n")
}

/**
 * for `code` and `output`
 */
export function unIndentCodeAndOutput([code]: readonly string[]): (
    args: readonly string[],
) => {
    code: string
    output: string
} {
    const codeLines = code.split("\n")
    const codeMinLineIndent = getMinIndent(codeLines)

    return ([output]: readonly string[]) => {
        const outputLines = output.split("\n")
        const minLineIndent = Math.min(
            getMinIndent(outputLines),
            codeMinLineIndent,
        )

        return {
            code: codeLines.map((line) => line.slice(minLineIndent)).join("\n"),
            output: outputLines
                .map((line) => line.slice(minLineIndent))
                .join("\n"),
        }
    }
}

/**
 * Get number of minimum indent
 */
function getMinIndent(lines: string[]) {
    const lineIndents = lines
        .filter((line) => line.trim())
        .map((line) => / */u.exec(line)![0].length)
    return Math.min(...lineIndents)
}

/**
 * Load test cases
 */
export function loadTestCases(
    ruleName: string,
    options?: { skipOutputTest?: boolean },
    additionals?: {
        valid?: (RuleTester.ValidTestCase | string)[]
        invalid?: RuleTester.InvalidTestCase[]
    },
): {
    valid: RuleTester.ValidTestCase[]
    invalid: RuleTester.InvalidTestCase[]
} {
    const validFixtureRoot = path.resolve(
        __dirname,
        `../fixtures/rules/${ruleName}/valid/`,
    )
    const invalidFixtureRoot = path.resolve(
        __dirname,
        `../fixtures/rules/${ruleName}/invalid/`,
    )

    const valid = listupInput(validFixtureRoot).map((inputFile) =>
        getConfig(ruleName, inputFile),
    )

    const fixable = plugin.rules[ruleName].meta.fixable != null

    const invalid = listupInput(invalidFixtureRoot).map((inputFile) => {
        const config = getConfig(ruleName, inputFile)
        const errorFile = inputFile.replace(
            /input\.(?:ya?ml|vue)$/u,
            "errors.json",
        )
        const outputFile = inputFile.replace(
            /input\.(?:ya?ml|vue)$/u,
            isYaml(inputFile) ? "output.yml" : "output.vue",
        )
        let errors
        try {
            errors = fs.readFileSync(errorFile, "utf8")
        } catch (e) {
            writeFixtures(ruleName, inputFile)
            errors = fs.readFileSync(errorFile, "utf8")
        }
        config.errors = JSON.parse(errors)
        if (fixable) {
            let output
            try {
                output = fs.readFileSync(outputFile, "utf8")
            } catch (e) {
                writeFixtures(ruleName, inputFile)
                output = fs.readFileSync(outputFile, "utf8")
            }
            config.output = output
        }

        return config
    })

    if (additionals) {
        if (additionals.valid) {
            valid.push(...additionals.valid)
        }
        if (additionals.invalid) {
            invalid.push(...additionals.invalid)
        }
    }
    for (const test of valid) {
        if (!test.code) {
            throw new Error(`Empty code: ${test.filename}`)
        }
    }
    for (const test of invalid) {
        if (!test.code) {
            throw new Error(`Empty code: ${test.filename}`)
        }
    }
    if (invalid.some((test) => test.output) && !options?.skipOutputTest) {
        describe(`Output test for ${ruleName}`, () => {
            for (const test of invalid.filter(
                ({ filename, skipOutputTest }) =>
                    isYaml(filename) && !skipOutputTest,
            )) {
                it(test.filename || test.code, () => {
                    const input = yamlESLintParser.parseForESLint(test.code)
                    const output = yamlESLintParser.parseForESLint(test.output)
                    assert.deepStrictEqual(
                        yamlESLintParser.getStaticYAMLValue(input.ast),
                        yamlESLintParser.getStaticYAMLValue(output.ast),
                    )
                })
            }
        })
    }
    for (const test of invalid) {
        delete test.skipOutputTest
    }

    return {
        valid,
        invalid,
    }
}

function listupInput(rootDir: string) {
    return [...itrListupInput(rootDir)]
}

function* itrListupInput(rootDir: string): IterableIterator<string> {
    for (const filename of fs.readdirSync(rootDir)) {
        if (filename.startsWith("_")) {
            // ignore
            continue
        }
        const abs = path.join(rootDir, filename)
        if (
            filename.endsWith("input.yml") ||
            filename.endsWith("input.yaml") ||
            filename.endsWith("input.vue")
        ) {
            yield abs
        } else if (fs.statSync(abs).isDirectory()) {
            yield* itrListupInput(abs)
        }
    }
}

function exists(f: string) {
    return fs.existsSync(f)
}

export function makeSuiteTests(
    ruleName: string,
    optionsList: { [name: string]: any[] },
    { force }: { force?: boolean } = {},
): void {
    const suiteFixtureRoot = path.resolve(
        __dirname,
        "../fixtures/yaml-test-suite/",
    )
    const invalidFixtureRoot = path.resolve(
        __dirname,
        `../fixtures/rules/${ruleName}/invalid/`,
    )
    const linter = getLinter(ruleName)

    let count = 0
    for (const fixture of itrListupInput(suiteFixtureRoot)) {
        const code0 = fs.readFileSync(fixture, "utf8")

        count++
        if (force && count % 100 === 0) {
            console.log(`${count} files on ${ruleName} / ${fixture}`)
        }

        for (const optionName of Object.keys(optionsList)) {
            const options = optionsList[optionName]

            const fixtureDir = path.join(
                invalidFixtureRoot,
                `yaml-test-suite-for-${optionName}/`,
            )
            const inputFile = path.join(fixtureDir, path.basename(fixture))
            const filename = inputFile.slice(inputFile.indexOf(ruleName))
            const code = `# ${filename}\n${code0}`

            const result = verify(
                linter,
                code,
                {
                    rules: {
                        [ruleName]: ["error", ...options],
                    },
                    parser: isYaml(inputFile)
                        ? "yaml-eslint-parser"
                        : "vue-eslint-parser",
                    settings: {
                        yml: { indent: 8 },
                    },
                },
                inputFile,
            )
            if (result.length) {
                // has error

                try {
                    fs.mkdirSync(fixtureDir)
                } catch {
                    // ignore
                }
                const configFile = path.join(
                    path.dirname(inputFile),
                    "_config.json",
                )

                if (!exists(configFile) || force) {
                    fs.writeFileSync(
                        configFile,
                        `${JSON.stringify(
                            {
                                options,
                                settings: {
                                    yml: { indent: 8 },
                                },
                            },
                            null,
                            2,
                        )}\n`,
                        "utf8",
                    )
                }
                fs.writeFileSync(inputFile, code0, "utf8")
                writeFixtures(
                    ruleName,
                    inputFile,
                    { indent: 8 },
                    {
                        force,
                    },
                )
            }
        }
    }
}

function writeFixtures(
    ruleName: string,
    inputFile: string,
    ymlSettings?: YMLSettings | null,
    { force }: { force?: boolean } = {},
) {
    const config = getConfig(ruleName, inputFile)
    if (!ymlSettings) {
        // eslint-disable-next-line no-param-reassign -- test
        ymlSettings = config?.settings?.yml
    }
    const linter = getLinter(ruleName)
    const errorFile = inputFile.replace(/input\.(?:ya?ml|vue)$/u, "errors.json")
    const outputFile = inputFile.replace(
        /input\.(?:ya?ml|vue)$/u,
        isYaml(inputFile) ? "output.yml" : "output.vue",
    )

    const result = linter.verify(
        config.code,
        {
            rules: {
                [ruleName]: ["error", ...(config.options || [])],
            },
            parser: isYaml(inputFile)
                ? "yaml-eslint-parser"
                : "vue-eslint-parser",
            parserOptions: config?.parserOptions,
            settings: {
                yml: ymlSettings,
            },
        },
        config.filename,
    )
    if (force || !exists(errorFile)) {
        fs.writeFileSync(
            errorFile,
            `${JSON.stringify(
                result.map((m) => ({
                    message: m.message,
                    line: m.line,
                    column: m.column,
                })),
                null,
                2,
            )}\n`,
            "utf8",
        )
    }

    if (force || !exists(outputFile)) {
        const output = applyFixes(config.code, result).output

        if (plugin.rules[ruleName].meta.fixable != null) {
            fs.writeFileSync(outputFile, output, "utf8")
        }
    }
}

function verify(
    linter: Linter,
    code: string,
    config: Linter.Config,
    filename: string,
): Linter.LintMessage[] {
    try {
        return linter.verify(code, config, filename)
    } catch (e) {
        console.error(`@ ${filename}`)
        throw e
    }
}

function getLinter(ruleName: string) {
    const linter = new Linter()
    // @ts-expect-error for test
    linter.defineParser("yaml-eslint-parser", yamlESLintParser)
    linter.defineParser("vue-eslint-parser", vueESLintParser as any)
    // @ts-expect-error for test
    linter.defineRule(ruleName, plugin.rules[ruleName])

    return linter
}

function getConfig(ruleName: string, inputFile: string) {
    const filename = inputFile.slice(inputFile.indexOf(ruleName))
    const code0 = fs.readFileSync(inputFile, "utf8")
    const overrideConfigFile: string = inputFile.replace(
        /input\.(?:ya?ml|vue)$/u,
        "override-config.json",
    )
    const overrideConfig = exists(overrideConfigFile)
        ? JSON.parse(fs.readFileSync(overrideConfigFile, "utf8"))
        : {}
    let code, config
    let configFile: string = inputFile.replace(
        /input\.(?:ya?ml|vue)$/u,
        "config.json",
    )
    if (!exists(configFile)) {
        configFile = path.join(path.dirname(inputFile), "_config.json")
    }
    if (exists(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, "utf8"))
    }
    if (config && typeof config === "object") {
        code = isYaml(inputFile)
            ? `# ${filename}\n${code0}`
            : `<!--${filename}-->\n${code0}`
        return Object.assign(
            isVue(inputFile)
                ? { parser: require.resolve("vue-eslint-parser") }
                : {},
            config,
            overrideConfig,
            { code, filename },
        )
    }
    // inline config
    const configStr = isYaml(inputFile)
        ? /^#([^\n]+)\n/u.exec(code0)
        : /^<!--(.*?)-->/u.exec(code0)
    if (!configStr) {
        fs.writeFileSync(inputFile, `# {}\n${code0}`, "utf8")
        throw new Error("missing config")
    } else {
        code = isYaml(inputFile)
            ? code0.replace(/^#([^\n]+)\n/u, `# ${filename}\n`)
            : code0.replace(/^<!--(.*?)-->/u, `<!--${filename}-->`)
        try {
            config = configStr ? JSON.parse(configStr[1]) : {}
        } catch (e: any) {
            throw new Error(`${e.message} in @ ${inputFile}`)
        }
    }

    return Object.assign(
        isVue(inputFile)
            ? { parser: require.resolve("vue-eslint-parser") }
            : {},
        config,
        { code, filename },
    )
}

function isYaml(fileName: string) {
    return !fileName || fileName.endsWith(".yml") || fileName.endsWith(".yaml")
}

function isVue(fileName: string) {
    return fileName.endsWith(".vue")
}
