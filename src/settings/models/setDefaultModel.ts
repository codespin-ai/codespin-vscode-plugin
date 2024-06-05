import { CodeSpinConfig } from "codespin/dist/settings/CodeSpinConfig.js";
import { readFile, writeFile } from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../codespinDirs.js";

export async function setDefaultModel(
  model: string,
  workspaceRoot: string
): Promise<void> {
  const projectConfigDir = getCodeSpinDir(workspaceRoot);
  const configFilePath = path.join(projectConfigDir, `codespin.json`);

  // Read the existing configuration
  const configContent = await readFile(configFilePath, { encoding: "utf-8" });
  const config = JSON.parse(configContent) as CodeSpinConfig;

  // Update the api and model properties
  config.model = model;

  // Write the updated configuration back to the file
  await writeFile(configFilePath, JSON.stringify(config, null, 2), {
    encoding: "utf-8",
  });
}
