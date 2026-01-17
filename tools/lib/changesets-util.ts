import getReleasePlan from "@changesets/get-release-plan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Get new version string from changesets */
export async function getNewVersion(): Promise<string> {
  const releasePlan = await getReleasePlan(path.resolve(__dirname, "../.."));

  return releasePlan.releases.find(({ name }) => name === "eslint-plugin-yml")!
    .newVersion;
}
