import { CodeSpinConfig } from "codespin/dist/settings/CodeSpinConfig.js";
import { readFile } from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../codespinDirs.js";

export async function getDefaultModel(workspaceRoot: string): Promise<string> {
  const projectConfigDir = getCodeSpinDir(workspaceRoot);
  const configFilePath = path.join(projectConfigDir, `codespin.json`);
  const config = JSON.parse(
    (await readFile(configFilePath)).toString()
  ) as CodeSpinConfig;

  return config.model ?? "";
}
