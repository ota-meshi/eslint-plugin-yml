import { makeSuiteTests } from "../tests/utils/utils"

makeSuiteTests(
    "block-mapping",
    {
        default: [],
        never: ["never"],
        always: ["always"],
    },
    { force: true },
)

makeSuiteTests(
    "block-sequence",
    {
        default: [],
        never: ["never"],
        always: ["always"],
    },
    { force: true },
)

makeSuiteTests(
    "no-tab-indent",
    {
        default: [],
    },
    { force: true },
)

makeSuiteTests(
    "indent",
    {
        default: [],
        two: [2],
        four: [4],
    },
    { force: true },
)
