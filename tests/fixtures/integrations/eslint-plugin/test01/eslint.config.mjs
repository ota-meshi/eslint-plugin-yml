
import { getPlugin } from "../plugin-store.cjs";
const yaml = getPlugin()
export default [
    {
        files: ["**/*.js"],
    },
    ...yaml.configs["flat/recommended"]
]
