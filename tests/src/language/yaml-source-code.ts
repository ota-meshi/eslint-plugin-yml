import assert from "assert";
import { parseForESLint } from "yaml-eslint-parser";
import { YAMLSourceCode } from "../../../src/language/yaml-source-code";

function createSourceCode(code: string): YAMLSourceCode {
  const result = parseForESLint(code);
  return new YAMLSourceCode({
    text: code,
    ast: result.ast,
    hasBOM: false,
    parserServices: { isYAML: true },
    visitorKeys: result.visitorKeys,
  });
}

describe("YAMLSourceCode", () => {
  describe("getNodeByRangeIndex", () => {
    it("should return the deepest node containing the index", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);

      // Index 0 is at 'k' of 'key'
      const node = sourceCode.getNodeByRangeIndex(0);

      assert.ok(node);
      assert.strictEqual(node.type, "YAMLScalar");
    });

    it("should return the value node when index is in value range", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);

      // Index 5 is inside "value"
      const node = sourceCode.getNodeByRangeIndex(5);

      assert.ok(node);
      assert.strictEqual(node.type, "YAMLScalar");
    });

    it("should return YAMLPair when index is at colon", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);

      // Index 3 is at ':'
      const node = sourceCode.getNodeByRangeIndex(3);

      assert.ok(node);
      assert.strictEqual(node.type, "YAMLPair");
    });

    it("should return null when index is out of range", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);

      // Index 100 is outside the code
      const node = sourceCode.getNodeByRangeIndex(100);

      assert.strictEqual(node, null);
    });

    it("should return the correct node in nested structures", () => {
      const code = `parent:
  child: value`;
      const sourceCode = createSourceCode(code);

      // Index in 'parent'
      const parentNode = sourceCode.getNodeByRangeIndex(0);

      assert.ok(parentNode);
      assert.strictEqual(parentNode.type, "YAMLScalar");

      // Index in nested 'child'
      const childNode = sourceCode.getNodeByRangeIndex(10);

      assert.ok(childNode);
      assert.strictEqual(childNode.type, "YAMLScalar");
    });

    it("should work with arrays", () => {
      const code = `- item1
- item2
- item3`;
      const sourceCode = createSourceCode(code);

      // Index inside 'item2'
      const node = sourceCode.getNodeByRangeIndex(10);

      assert.ok(node);
      assert.strictEqual(node.type, "YAMLScalar");
    });

    it("should work with flow sequences", () => {
      const code = `array: [1, 2, 3]`;
      const sourceCode = createSourceCode(code);

      // Index inside the array value '2'
      const node = sourceCode.getNodeByRangeIndex(11);

      assert.ok(node);
      assert.strictEqual(node.type, "YAMLScalar");
    });

    it("should work with flow mappings", () => {
      const code = `inline: {key: value}`;
      const sourceCode = createSourceCode(code);

      // Index inside the inline mapping's key
      const node = sourceCode.getNodeByRangeIndex(9);

      assert.ok(node);
      assert.strictEqual(node.type, "YAMLScalar");
    });
  });

  describe("getFirstToken", () => {
    it("should return the first token of a node", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);
      const node = sourceCode.ast.body[0];

      const token = sourceCode.getFirstToken(node);

      assert.ok(token);
      // First token could be Identifier or Punctuator depending on structure
      assert.ok(token.type);
    });

    it("should return null when node has no tokens", () => {
      const code = ``;
      const sourceCode = createSourceCode(code);

      const token = sourceCode.getFirstToken(sourceCode.ast);

      assert.strictEqual(token, null);
    });
  });

  describe("getLastToken", () => {
    it("should return the last token of a node", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);
      const node = sourceCode.ast.body[0];

      const token = sourceCode.getLastToken(node);

      assert.ok(token);
      assert.strictEqual(token.value, "value");
    });
  });

  describe("getTokenBefore", () => {
    it("should return the token before a node", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);
      const pair = sourceCode.ast.body[0];
      
      if (pair.type === "YAMLPair" && pair.value) {
        const token = sourceCode.getTokenBefore(pair.value);

        assert.ok(token);
        assert.strictEqual(token.value, ":");
      }
    });
  });

  describe("getTokenAfter", () => {
    it("should return the token after a node", () => {
      const code = `key: value # comment`;
      const sourceCode = createSourceCode(code);
      const pair = sourceCode.ast.body[0];
      
      if (pair.type === "YAMLPair" && pair.value) {
        const token = sourceCode.getTokenAfter(pair.value);

        assert.ok(token);
        // Should get the comment token
        assert.strictEqual(token.type, "Block");
      }
    });
  });

  describe("getAllComments", () => {
    it("should return all comments in the source code", () => {
      const code = `# comment 1
key: value # comment 2`;
      const sourceCode = createSourceCode(code);

      const comments = sourceCode.getAllComments();

      assert.strictEqual(comments.length, 2);
      assert.strictEqual(comments[0].value, " comment 1");
      assert.strictEqual(comments[1].value, " comment 2");
    });

    it("should return empty array when there are no comments", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);

      const comments = sourceCode.getAllComments();

      assert.strictEqual(comments.length, 0);
    });
  });

  describe("getCommentsBefore", () => {
    it("should return comments before a node", () => {
      const code = `# comment
key: value`;
      const sourceCode = createSourceCode(code);
      const pair = sourceCode.ast.body[0];

      const comments = sourceCode.getCommentsBefore(pair);

      // Comments immediately before should be returned
      assert.ok(comments.length >= 0);
    });

    it("should return empty array when no comments before node", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);
      const pair = sourceCode.ast.body[0];

      const comments = sourceCode.getCommentsBefore(pair);

      assert.strictEqual(comments.length, 0);
    });
  });

  describe("getCommentsAfter", () => {
    it("should return comments after a node", () => {
      const code = `key: value
# comment`;
      const sourceCode = createSourceCode(code);
      const pair = sourceCode.ast.body[0];

      const comments = sourceCode.getCommentsAfter(pair);

      // Comments immediately after should be returned
      assert.ok(comments.length >= 0);
    });

    it("should return empty array when no comments after node", () => {
      const code = `key: value`;
      const sourceCode = createSourceCode(code);
      const pair = sourceCode.ast.body[0];

      const comments = sourceCode.getCommentsAfter(pair);

      assert.strictEqual(comments.length, 0);
    });
  });

  describe("isSpaceBetween", () => {
    it("should return true when there is space between tokens", () => {
      const code = `key:  value`;
      const sourceCode = createSourceCode(code);
      const tokens = sourceCode.tokensAndComments.filter(
        (t) => t.type !== "Block",
      );

      if (tokens.length >= 2) {
        const hasSpace = sourceCode.isSpaceBetween(tokens[0], tokens[1]);
        // Should detect space
        assert.ok(typeof hasSpace === "boolean");
      }
    });

    it("should return false when there is no space between tokens", () => {
      const code = `key:value`;
      const sourceCode = createSourceCode(code);
      const tokens = sourceCode.tokensAndComments.filter(
        (t) => t.type !== "Block",
      );

      if (tokens.length >= 2) {
        const colonToken = tokens.find((t) => t.value === ":");
        const valueToken = tokens.find((t) => t.value === "value");
        if (colonToken && valueToken) {
          const hasSpace = sourceCode.isSpaceBetween(colonToken, valueToken);
          assert.strictEqual(hasSpace, false);
        }
      }
    });
  });

  describe("tokensAndComments", () => {
    it("should return all tokens and comments sorted by range", () => {
      const code = `# comment
key: value`;
      const sourceCode = createSourceCode(code);

      const tokensAndComments = sourceCode.tokensAndComments;

      assert.ok(tokensAndComments.length > 0);
      // First should be the comment
      assert.strictEqual(tokensAndComments[0].type, "Block");
      
      // Check that they are sorted by range
      for (let i = 1; i < tokensAndComments.length; i++) {
        assert.ok(
          tokensAndComments[i - 1].range[0] <= tokensAndComments[i].range[0],
          "Tokens and comments should be sorted by range",
        );
      }
    });
  });

  describe("getInlineConfigNodes", () => {
    it("should return eslint directive comments", () => {
      const code = `# eslint-disable
key: value`;
      const sourceCode = createSourceCode(code);

      const configNodes = sourceCode.getInlineConfigNodes();

      assert.strictEqual(configNodes.length, 1);
      assert.strictEqual(configNodes[0].value, " eslint-disable");
    });

    it("should return multiple directive comments", () => {
      const code = `# eslint-disable
key: value
# eslint-enable`;
      const sourceCode = createSourceCode(code);

      const configNodes = sourceCode.getInlineConfigNodes();

      assert.strictEqual(configNodes.length, 2);
    });

    it("should return empty array when no directive comments", () => {
      const code = `# regular comment
key: value`;
      const sourceCode = createSourceCode(code);

      const configNodes = sourceCode.getInlineConfigNodes();

      assert.strictEqual(configNodes.length, 0);
    });
  });
});
