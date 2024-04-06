import { CodespinConfig } from "codespin/dist/settings/CodespinConfig.js";
import { readFile, writeFile } from "fs/promises";
import * as path from "path";
import { getCodespinDir } from "../settings/codespinDirs.js";

export async function setDefaultModel(
  apiAndModel: string,
  workspaceRoot: string
): Promise<void> {
  const [api, model] = apiAndModel.split(":");
  const projectConfigDir = await getCodespinDir(workspaceRoot);
  const configFilePath = path.join(projectConfigDir, `codespin.json`);

  // Read the existing configuration
  const configContent = await readFile(configFilePath, { encoding: "utf-8" });
  const config = JSON.parse(configContent) as CodespinConfig;

  // Update the api and model properties
  config.api = api;
  config.model = model;

  // Write the updated configuration back to the file
  await writeFile(configFilePath, JSON.stringify(config, null, 2), {
    encoding: "utf-8",
  });
}
