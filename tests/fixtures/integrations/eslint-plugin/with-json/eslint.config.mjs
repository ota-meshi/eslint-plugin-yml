import json from "@eslint/json";
import { getPlugin } from "../plugin-store.cjs";
const yaml = getPlugin()
export default [
    ...yaml.configs["flat/recommended"],
	{
		plugins: {
			json,
		},
	},

	// lint JSON files
	{
		files: ["**/*.json"],
		language: "json/json",
		rules: {
			"json/no-duplicate-keys": "error",
		},
	},

	// lint JSONC files
	{
		files: ["**/*.jsonc", ".vscode/*.json"],
		language: "json/jsonc",
		rules: {
			"json/no-duplicate-keys": "error",
		},
	},

	// lint JSON5 files
	{
		files: ["**/*.json5"],
		language: "json/json5",
		rules: {
			"json/no-duplicate-keys": "error",
		},
	},
]
