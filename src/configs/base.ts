export = {
    plugins: ["yml"],
    overrides: [
        {
            files: ["*.yaml", "*.yml"],
            parser: require.resolve("yaml-eslint-parser"),
            rules: {
                "no-irregular-whitespace": "off",
                "spaced-comment": "off",
            },
        },
    ],
}
