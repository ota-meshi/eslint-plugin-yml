import assert from "assert";
import plugin from "../../src";
import pkg from "../../package.json" with { type: "json" };
const { version } = pkg;
const expectedMeta = {
  name: "eslint-plugin-yml",
  version,
};

describe("Test for meta object", () => {
  it("A plugin should have a meta object.", () => {
    assert.strictEqual(plugin.meta.name, expectedMeta.name);
    assert.strictEqual(typeof plugin.meta.version, "string");
  });

  for (const [name, processor] of Object.entries(
    // @ts-expect-error -- missing processors
    plugin.processors || {},
  )) {
    it(`"${name}" processor should have a meta object.`, () => {
      // @ts-expect-error -- missing type
      assert.strictEqual(processor.meta.name, expectedMeta.name);
      // @ts-expect-error -- missing type
      assert.strictEqual(typeof processor.meta.version, "string");
    });
  }
});
