import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-parsing-error-in-vue-custom-block"
import { loadTestCases, makeSuiteTests } from "../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

// TODO Delete when it are done.
makeSuiteTests("no-parsing-error-in-vue-custom-block", {
    default: [],
    // never: ["never"],
    // always: ["always"],
})

tester.run(
    "no-parsing-error-in-vue-custom-block",
    rule as any,
    loadTestCases("no-parsing-error-in-vue-custom-block"),
)
