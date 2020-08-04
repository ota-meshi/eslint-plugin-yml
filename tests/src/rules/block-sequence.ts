import { RuleTester } from "eslint"
import rule from "../../../src/rules/block-sequence"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run(
    "block-sequence",
    rule as any,
    loadTestCases("block-sequence", { fixable: true }),
)
