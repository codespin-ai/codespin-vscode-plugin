import * as path from "path";
import * as os from "os";
import { pathExists } from "../../fs/pathExists.js";
import { getCodeSpinDir } from "../codespinDirs.js";

export async function getProviderConfigPath(
  provider: string,
  workspaceRoot: string
): Promise<string | undefined> {
  const projectConfigDir = getCodeSpinDir(workspaceRoot);
  const configFilePath = path.join(projectConfigDir, `${provider}.json`);
  if (await pathExists(configFilePath)) {
    return configFilePath;
  }

  const rootConfigDir = path.join(os.homedir(), ".codespin");
  const rootConfigPath = path.join(rootConfigDir, `${provider}.json`);
  if (await pathExists(rootConfigPath)) {
    return rootConfigPath;
  }

  return undefined;
}
