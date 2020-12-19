import { RuleTester } from "eslint"
import rule from "../../../src/rules/key-spacing"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("key-spacing", rule as any, loadTestCases("key-spacing"))
