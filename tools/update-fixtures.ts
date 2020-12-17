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

makeSuiteTests(
    "flow-mapping-curly-newline",
    {
        default: [],
        always: ["always"],
        never: ["never"],
    },
    { force: true },
)

makeSuiteTests(
    "flow-mapping-curly-spacing",
    {
        default: [],
        never: ["never"],
        always: ["always"],
    },
    { force: true },
)

makeSuiteTests(
    "flow-sequence-bracket-newline",
    {
        default: [],
        never: ["never"],
        always: ["always"],
    },
    { force: true },
)

makeSuiteTests(
    "flow-sequence-bracket-spacing",
    {
        default: [],
        never: ["never"],
        always: ["always"],
    },
    { force: true },
)

makeSuiteTests(
    "sort-keys",
    {
        default: [],
        desc: ["desc"],
        asc: ["asc"],
    },
    { force: true },
)
