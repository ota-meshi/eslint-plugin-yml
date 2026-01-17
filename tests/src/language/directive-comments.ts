import assert from "assert";
import { Linter } from "eslint";
import plugin from "../../../src/index";

/**
 * Creates a config array for testing with the specified rules.
 */
function createConfig(rules: Linter.RulesRecord): Linter.Config[] {
  return [
    {
      files: ["**/*.yaml", "**/*.yml"],
      plugins: { yml: plugin },
      language: "yml/yaml",
      rules,
    },
  ];
}

/**
 * Test suite for ESLint directive comments in YAML files.
 *
 * Tests that eslint-disable, eslint-disable-line, eslint-disable-next-line,
 * and eslint-enable directives work correctly in YAML files.
 */
describe("Directive Comments", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("eslint-disable", () => {
    it("should disable all rules for the rest of the file", () => {
      const code = `# eslint-disable
: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by eslint-disable comment",
      );
    });

    it("should disable a specific rule for the rest of the file", () => {
      const code = `# eslint-disable yml/no-empty-key
: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by eslint-disable comment",
      );
    });

    it("should not disable rules not mentioned in the directive", () => {
      const code = `# eslint-disable yml/some-other-rule
: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(
        errors.length,
        1,
        "Rule should not be disabled when different rule is specified",
      );
    });
  });

  describe("eslint-enable", () => {
    it("should re-enable rules after eslint-disable", () => {
      const code = `# eslint-disable yml/no-empty-key
foo: bar
# eslint-enable yml/no-empty-key
: qux
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(errors.length, 1, "Should have exactly one error");
      assert.strictEqual(errors[0].line, 4, "Error should be on line 4");
    });

    it("should re-enable all rules after eslint-disable all", () => {
      const code = `# eslint-disable
foo: bar
# eslint-enable
: qux
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(errors.length, 1, "Should have exactly one error");
      assert.strictEqual(errors[0].line, 4, "Error should be on line 4");
    });
  });

  describe("eslint-disable-line", () => {
    it("should disable all rules for the current line", () => {
      const code = `: bar # eslint-disable-line
foo: qux
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(errors.length, 0, "Should have no errors");
    });

    it("should disable a specific rule for the current line", () => {
      const code = `: bar # eslint-disable-line yml/no-empty-key
foo: qux
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(errors.length, 0, "Should have no errors");
    });

    it("should not disable other rules on the same line", () => {
      const code = `: bar # eslint-disable-line yml/no-empty-key
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const emptyKeyErrors = messages.filter(
        (m) => m.ruleId === "yml/no-empty-key",
      );

      assert.strictEqual(
        emptyKeyErrors.length,
        0,
        "no-empty-key should be disabled",
      );
    });
  });

  describe("eslint-disable-next-line", () => {
    it("should disable all rules for the next line", () => {
      const code = `# eslint-disable-next-line
: bar
foo: qux
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(errors.length, 0, "Should have no errors");
    });

    it("should disable a specific rule for the next line", () => {
      const code = `# eslint-disable-next-line yml/no-empty-key
: bar
foo: qux
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(errors.length, 0, "Should have no errors");
    });

    it("should work with description after --", () => {
      const code = `# eslint-disable-next-line yml/no-empty-key -- this is intentional
: bar
foo: qux
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(errors.length, 0, "Should have no errors");
    });
  });

  describe("multiple rules", () => {
    it("should disable a specific rule with eslint-disable-next-line", () => {
      const code = `# eslint-disable-next-line yml/no-empty-key
: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId?.startsWith("yml/"));

      assert.strictEqual(errors.length, 0, "Rule should be disabled");
    });

    it("should disable multiple rules in eslint-disable", () => {
      const code = `# eslint-disable yml/no-empty-key
: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId?.startsWith("yml/"));

      assert.strictEqual(errors.length, 0, "Rule should be disabled");
    });
  });

  describe("baseline - no directive", () => {
    it("should report errors when no directive is present", () => {
      const code = `: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(
        errors.length,
        1,
        "Should report an error for empty key",
      );
    });
  });
});

/**
 * Test suite for ESLint inline configuration comments in YAML files.
 *
 * Tests that eslint comments can be used to configure rules inline.
 */
describe("Inline Configuration Comments", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("eslint inline config", () => {
    it("should configure rules via eslint comment", () => {
      // Enable a rule via inline config
      const code = `# eslint yml/no-empty-key: "error"
: bar
`;
      const config = createConfig({});

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(
        errors.length,
        1,
        "Rule should be enabled by inline config",
      );
    });

    it("should override existing rule configuration", () => {
      // Rule is set to error in config, but inline config disables it
      const code = `# eslint yml/no-empty-key: "off"
: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by inline config",
      );
    });

    it("should configure a rule with inline config comment", () => {
      const code = `# eslint yml/no-empty-key: "off"
: bar
`;
      const config = createConfig({
        "yml/no-empty-key": "error",
      });

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId?.startsWith("yml/"));

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by inline config",
      );
    });

    it("should report error for invalid inline config syntax", () => {
      const code = `# eslint { invalid json
: bar
`;
      const config = createConfig({});

      const messages = linter.verify(code, config, "test.yaml");
      // Invalid syntax should be reported as a problem
      const configErrors = messages.filter((m) => m.ruleId === null);

      assert.ok(
        configErrors.length > 0,
        "Should report an error for invalid inline config syntax",
      );
    });

    it("should report error for unknown rule in inline config", () => {
      const code = `# eslint unknown-rule: "error"
: bar
`;
      const config = createConfig({});

      const messages = linter.verify(code, config, "test.yaml");
      // Unknown rule should be reported
      const unknownRuleErrors = messages.filter((m) =>
        m.message.includes("Definition for rule"),
      );

      assert.ok(
        unknownRuleErrors.length > 0,
        "Should report an error for unknown rule",
      );
    });
  });

  describe("combining directives and inline config", () => {
    it("should work with both inline config and disable directives", () => {
      const code = `# eslint yml/no-empty-key: "error"
# eslint-disable-next-line yml/no-empty-key
: bar
foo: qux
`;
      const config = createConfig({});

      const messages = linter.verify(code, config, "test.yaml");
      const errors = messages.filter((m) => m.ruleId === "yml/no-empty-key");

      // Line 3 should be disabled, no errors expected since line 4 has valid key
      assert.strictEqual(errors.length, 0, "Should have no errors");
    });
  });
});
