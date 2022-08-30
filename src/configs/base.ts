export = {
  plugins: ["yml"],
  overrides: [
    {
      files: ["*.yaml", "*.yml"],
      parser: require.resolve("yaml-eslint-parser"),
      rules: {
        // ESLint core rules known to cause problems with YAML.
        "no-irregular-whitespace": "off",
        "spaced-comment": "off",
      },
    },
  ],
};
