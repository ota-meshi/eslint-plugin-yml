import path from "path"
import assert from "assert"
import { CLIEngine } from "eslint"
import plugin from "../../src/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")

describe("Integration with eslint-plugin-yml", () => {
    it("should lint without errors", () => {
        const engine = new CLIEngine({
            cwd: TEST_CWD,
            extensions: [".js", ".yml"],
        })
        engine.addPlugin("eslint-plugin-yml", plugin)
        const r = engine.executeOnFiles(["test01/src"])
        assert.strictEqual(r.results.length, 2)
        assert.strictEqual(r.errorCount, 0)
    })

    // https://github.com/ota-meshi/eslint-plugin-yml/issues/89
    it("should lint without error when use the 'no-multi-spaces' rule and block node together.", () => {
        const engine = new CLIEngine({
            cwd: TEST_CWD,
            extensions: [".yml"],
        })
        engine.addPlugin("eslint-plugin-yml", plugin)
        const r = engine.executeOnFiles(["issue89/src"])
        assert.strictEqual(r.results.length, 1)
        assert.strictEqual(r.errorCount, 0)
    })
})
