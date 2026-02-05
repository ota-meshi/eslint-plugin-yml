import assert from "node:assert";
import { parseYAML } from "yaml-eslint-parser";
import { TokenStore } from "../../../src/language/token-store.ts";
import type { AST } from "yaml-eslint-parser";

function parse(code: string): AST.YAMLProgram {
  return parseYAML(code);
}

describe("TokenStore", () => {
  describe("getFirstToken", () => {
    it("should return the first token of a node", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getFirstToken(pair);

      assert.ok(token);
      // In YAML, the first token of a pair is the key
      assert.strictEqual(token.type, "Identifier");
      assert.strictEqual(token.value, "key");
    });

    it("should return the first token with skip option", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getFirstToken(pair, { skip: 1 });

      assert.ok(token);
      assert.strictEqual(token.type, "Punctuator");
      assert.strictEqual(token.value, ":");
    });

    it("should return null when skip exceeds available tokens", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getFirstToken(pair, { skip: 10 });

      assert.strictEqual(token, null);
    });

    it("should exclude comments by default", () => {
      const ast = parse(`arr: [1, # comment
  2]`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const arr = pair.value;
      assert.ok(arr);

      // Get all tokens including comments
      const tokens = store.getTokens(arr, { includeComments: true });
      const hasComment = tokens.some((t) => t.type === "Block");
      assert.ok(
        hasComment,
        "Test setup: there should be a comment in the node",
      );

      // getFirstToken should skip comments by default
      const firstToken = store.getFirstToken(arr);
      assert.ok(firstToken);
      assert.notStrictEqual(firstToken.type, "Block");
      assert.strictEqual(firstToken.value, "[");
    });

    it("should filter tokens with filter option", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getFirstToken(pair, {
        filter: (t) => t.type === "Punctuator",
      });

      assert.ok(token);
      assert.strictEqual(token.type, "Punctuator");
      assert.strictEqual(token.value, ":");
    });
  });

  describe("getLastToken", () => {
    it("should return the last token of a node", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getLastToken(pair);

      assert.ok(token);
      assert.strictEqual(token.value, "value");
    });

    it("should return the last token with skip option", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getLastToken(pair, { skip: 1 });

      assert.ok(token);
      assert.strictEqual(token.type, "Punctuator");
      assert.strictEqual(token.value, ":");
    });

    it("should exclude comments by default", () => {
      const ast = parse(`arr: [1 # comment
  ]`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const arr = pair.value;
      assert.ok(arr);

      // Get all tokens including comments
      const tokens = store.getTokens(arr, { includeComments: true });
      const hasComment = tokens.some((t) => t.type === "Block");
      assert.ok(
        hasComment,
        "Test setup: there should be a comment in the node",
      );

      // getLastToken should skip comments by default
      const lastToken = store.getLastToken(arr);
      assert.ok(lastToken);
      assert.notStrictEqual(lastToken.type, "Block");
      assert.strictEqual(lastToken.value, "]");
    });

    it("should include comments when option is set", () => {
      const ast = parse(`arr: [1 # comment
  ]`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const arr = pair.value;
      assert.ok(arr);

      // The comment is between "1" and "]" so lastToken with includeComments
      // should still be "]" since comment is not the last
      // Instead, let's test that we can retrieve the comment with skip
      const lastTokenWithComments = store.getLastToken(arr, {
        includeComments: true,
        skip: 1,
      });

      assert.ok(lastTokenWithComments);
      assert.strictEqual(lastTokenWithComments.type, "Block");
    });
  });

  describe("getTokenBefore", () => {
    it("should return the token before a node", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const value = pair.value;

      if (value) {
        const token = store.getTokenBefore(value);

        assert.ok(token);
        assert.strictEqual(token.type, "Punctuator");
        assert.strictEqual(token.value, ":");
      }
    });

    it("should return null when there is no token before", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getTokenBefore(pair);

      assert.strictEqual(token, null);
    });

    it("should exclude comments by default", () => {
      const ast = parse(`key1: value1 # comment
key2: value2`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair2 = content.pairs[1];
      assert.strictEqual(pair2.type, "YAMLPair");
      const key2 = pair2.key;
      assert.ok(key2);

      // getTokenBefore should skip comments by default
      const token = store.getTokenBefore(key2);
      assert.ok(token);
      assert.notStrictEqual(token.type, "Block");
      assert.strictEqual(token.value, "value1");
    });
  });

  describe("getTokenAfter", () => {
    it("should return the token after a node", () => {
      const ast = parse(`key: value
another: test`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair1 = content.pairs[0];
      assert.strictEqual(pair1.type, "YAMLPair");

      const token = store.getTokenAfter(pair1);

      assert.ok(token);
      // Next token after first pair is the key of second pair
      assert.strictEqual(token.type, "Identifier");
      assert.strictEqual(token.value, "another");
    });

    it("should return null when there is no token after", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getTokenAfter(pair);

      assert.strictEqual(token, null);
    });

    it("should exclude comments by default", () => {
      const ast = parse(`key1: value1 # comment
key2: value2`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair1 = content.pairs[0];
      assert.strictEqual(pair1.type, "YAMLPair");

      // getTokenAfter should skip comments by default
      const token = store.getTokenAfter(pair1);
      assert.ok(token);
      assert.notStrictEqual(token.type, "Block");
      assert.strictEqual(token.type, "Identifier");
      assert.strictEqual(token.value, "key2");
    });
  });

  describe("getTokensBefore", () => {
    it("should return tokens before a node", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const value = pair.value;

      if (value) {
        const tokens = store.getTokensBefore(value, { count: 1 });

        assert.strictEqual(tokens.length, 1);
        assert.strictEqual(tokens[0].value, ":");
      }
    });
  });

  describe("getTokens", () => {
    it("should return all tokens within a node", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const tokens = store.getTokens(pair);

      assert.ok(tokens.length >= 2);
      const hasColon = tokens.some((t) => t.value === ":");
      const hasValue = tokens.some((t) => t.value === "value");
      assert.ok(hasColon);
      assert.ok(hasValue);
    });

    it("should limit tokens with count option", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const tokens = store.getTokens(pair, { count: 1 });

      assert.strictEqual(tokens.length, 1);
    });

    it("should filter tokens with filter option", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const tokens = store.getTokens(pair, {
        filter: (t) => t.type === "Punctuator",
      });

      assert.strictEqual(tokens.length, 1);
      assert.strictEqual(tokens[0].value, ":");
    });
  });

  describe("getTokensBetween", () => {
    it("should return tokens between two nodes", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      if (pair.key && pair.value) {
        const tokens = store.getTokensBetween(pair.key, pair.value);

        assert.strictEqual(tokens.length, 1);
        assert.strictEqual(tokens[0].value, ":");
      }
    });
  });

  describe("getFirstTokenBetween", () => {
    it("should return the first token between two nodes", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      if (pair.key && pair.value) {
        const token = store.getFirstTokenBetween(pair.key, pair.value);

        assert.ok(token);
        assert.strictEqual(token.value, ":");
      }
    });

    it("should exclude comments by default", () => {
      const ast = parse(`arr: [1, # comment
  2, 3]`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const arr = pair.value;
      assert.ok(arr);
      assert.strictEqual(arr.type, "YAMLSequence");
      const firstElement = arr.entries[0];
      const secondElement = arr.entries[1];
      assert.ok(firstElement);
      assert.ok(secondElement);

      // getFirstTokenBetween should skip comments by default
      const token = store.getFirstTokenBetween(firstElement, secondElement);
      assert.ok(token);
      assert.notStrictEqual(token.type, "Block");
      assert.strictEqual(token.type, "Punctuator");
      assert.strictEqual(token.value, ",");
    });

    it("should include comments when option is set", () => {
      const ast = parse(`arr: [1, # comment
  2, 3]`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const arr = pair.value;
      assert.ok(arr);
      assert.strictEqual(arr.type, "YAMLSequence");
      const firstElement = arr.entries[0];
      const secondElement = arr.entries[1];
      assert.ok(firstElement);
      assert.ok(secondElement);

      // with includeComments, it should return the "," first
      const token = store.getFirstTokenBetween(firstElement, secondElement, {
        includeComments: true,
      });
      assert.ok(token);
      assert.strictEqual(token.type, "Punctuator");
      assert.strictEqual(token.value, ",");

      // skip 1 should get the comment
      const commentToken = store.getFirstTokenBetween(
        firstElement,
        secondElement,
        {
          includeComments: true,
          skip: 1,
        },
      );
      assert.ok(commentToken);
      assert.strictEqual(commentToken.type, "Block");
    });
  });

  describe("getCommentsBefore", () => {
    it("should return comments directly before a node", () => {
      const ast = parse(`# comment
key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const comments = store.getCommentsBefore(pair);

      assert.strictEqual(comments.length, 1);
      assert.strictEqual(comments[0].value, " comment");
    });

    it("should return multiple consecutive comments", () => {
      const ast = parse(`# comment1
# comment2
key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const comments = store.getCommentsBefore(pair);

      assert.strictEqual(comments.length, 2);
      assert.strictEqual(comments[0].value, " comment1");
      assert.strictEqual(comments[1].value, " comment2");
    });

    it("should return empty array when no comments before", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const comments = store.getCommentsBefore(pair);

      assert.strictEqual(comments.length, 0);
    });

    it("should stop at non-comment token", () => {
      const ast = parse(`key1: value1
# comment
key2: value2`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair2 = content.pairs[1];
      assert.strictEqual(pair2.type, "YAMLPair");

      const comments = store.getCommentsBefore(pair2);

      assert.strictEqual(comments.length, 1);
      assert.strictEqual(comments[0].value, " comment");
    });
  });

  describe("getCommentsAfter", () => {
    it("should return comments directly after a node", () => {
      const ast = parse(`key: value # comment`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const comments = store.getCommentsAfter(pair);

      assert.strictEqual(comments.length, 1);
      assert.strictEqual(comments[0].value, " comment");
    });

    it("should return empty array when no comments after", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const comments = store.getCommentsAfter(pair);

      assert.strictEqual(comments.length, 0);
    });

    it("should stop at non-comment token", () => {
      const ast = parse(`key1: value1 # comment
key2: value2`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair1 = content.pairs[0];
      assert.strictEqual(pair1.type, "YAMLPair");

      const comments = store.getCommentsAfter(pair1);

      assert.strictEqual(comments.length, 1);
      assert.strictEqual(comments[0].value, " comment");
    });
  });

  describe("options as number", () => {
    it("should treat number option as skip for getFirstToken", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getFirstToken(pair, 1);

      assert.ok(token);
      // Skip 1 from first token (key) gives us the colon
      assert.strictEqual(token.value, ":");
    });

    it("should treat number option as count for getTokens", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const tokens = store.getTokens(pair, 1);

      assert.strictEqual(tokens.length, 1);
    });
  });

  describe("options as filter function", () => {
    it("should use function as filter for getFirstToken", () => {
      const ast = parse(`key: value`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const token = store.getFirstToken(pair, (t) => t.type === "Identifier");

      assert.ok(token);
      assert.strictEqual(token.type, "Identifier");
    });
  });

  describe("complex YAML structures", () => {
    it("should handle flow sequence tokens", () => {
      const ast = parse(`arr: [1, 2, 3]`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const arr = pair.value;

      if (arr) {
        const tokens = store.getTokens(arr);

        assert.ok(tokens.length > 0);
        const values = tokens.map((t) => t.value);
        assert.ok(values.includes("["));
        assert.ok(values.includes("]"));
      }
    });

    it("should handle flow mapping tokens", () => {
      const ast = parse(`inline: { a: 1, b: 2 }`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");
      const flowMapping = pair.value;

      if (flowMapping) {
        const tokens = store.getTokens(flowMapping);

        assert.ok(tokens.length > 0);
        const values = tokens.map((t) => t.value);
        assert.ok(values.includes("{"));
        assert.ok(values.includes("}"));
      }
    });

    it("should handle block sequence tokens", () => {
      const ast = parse(`items:
  - item1
  - item2`);
      const store = new TokenStore({ ast });
      const doc = ast.body[0];
      assert.strictEqual(doc.type, "YAMLDocument");
      const content = doc.content;
      assert.ok(content);
      assert.strictEqual(content.type, "YAMLMapping");
      const pair = content.pairs[0];
      assert.strictEqual(pair.type, "YAMLPair");

      const firstToken = store.getFirstToken(pair);
      const lastToken = store.getLastToken(pair);

      assert.ok(firstToken);
      // First token of pair is the key
      assert.strictEqual(firstToken.value, "items");
      assert.ok(lastToken);
      assert.strictEqual(lastToken.value, "item2");
    });
  });
});
