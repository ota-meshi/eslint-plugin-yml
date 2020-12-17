import { RuleTester } from "eslint"
import rule from "../../../src/rules/sort-keys"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("sort-keys", rule as any, loadTestCases("sort-keys"))
