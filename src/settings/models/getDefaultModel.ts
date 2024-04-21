import { CodespinConfig } from "codespin/dist/settings/CodespinConfig.js";
import { readFile } from "fs/promises";
import * as path from "path";
import { getCodespinDir } from "../codespinDirs.js";

export async function getDefaultModel(workspaceRoot: string): Promise<string> {
  const projectConfigDir = getCodespinDir(workspaceRoot);
  const configFilePath = path.join(projectConfigDir, `codespin.json`);
  const config = JSON.parse(
    (await readFile(configFilePath)).toString()
  ) as CodespinConfig;

  return config.model ?? "";
}
