import { RuleTester } from "eslint"
import rule from "../../../../src/rules/vue-custom-block/no-parsing-error"
import { loadTestCases } from "../../../utils/utils"

const tester = new RuleTester({
    parser: require.resolve("yaml-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run(
    "vue-custom-block/no-parsing-error",
    rule as any,
    loadTestCases("vue-custom-block/no-parsing-error"),
)
