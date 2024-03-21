"use strict";

module.exports = {
  root: true,
  extends: [require.resolve("./.eslintrc.js")],
  overrides: [
    {
      files: ["tests/src/rules/*"],
      extends: ["plugin:eslint-rule-tester/recommended-legacy"],
    },
  ],
};
