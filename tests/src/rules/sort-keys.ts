import { RuleTester } from "eslint"
import rule from "../../../src/rules/sort-keys"
import { loadTestCases, makeSuiteTests } from "../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

makeSuiteTests("sort-keys", {
    default: [],
    desc: ["desc"],
    asc: ["asc"],
})

tester.run("sort-keys", rule as any, loadTestCases("sort-keys"))
