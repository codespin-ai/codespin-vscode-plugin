import * as path from "path";
import * as os from "os";
import { pathExists } from "../../fs/pathExists.js";
import { getCodespinDir } from "../codespinDirs.js";

export async function getAPIConfigPath(
  api: string,
  workspaceRoot: string
): Promise<string | undefined> {
  const projectConfigDir = await getCodespinDir(workspaceRoot);
  const configFilePath = path.join(projectConfigDir, `${api}.json`);
  if (await pathExists(configFilePath)) {
    return configFilePath;
  }

  const rootConfigDir = path.join(os.homedir(), ".codespin");
  const rootConfigPath = path.join(rootConfigDir, `${api}.json`);
  if (await pathExists(rootConfigPath)) {
    return rootConfigPath;
  }

  return undefined;
}
