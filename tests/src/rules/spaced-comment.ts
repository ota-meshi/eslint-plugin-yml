import { RuleTester } from "eslint"
import rule from "../../../src/rules/spaced-comment"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("spaced-comment", rule as any, loadTestCases("spaced-comment"))
