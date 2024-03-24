import * as path from "path";
import * as os from "os";
import { promises as fs } from "fs";
import { pathExists } from "../fs/pathExists.js";

async function getConfigFilePath(
  pathFragment: string,
  workspaceRoot: string
): Promise<string | undefined> {
  const workspaceConfigPath = path.join(
    workspaceRoot,
    ".codespin",
    pathFragment
  );
  if (await pathExists(workspaceConfigPath)) {
    return workspaceConfigPath;
  }

  const homeDirConfigPath = path.join(os.homedir(), ".codespin", pathFragment);
  if (await pathExists(homeDirConfigPath)) {
    return homeDirConfigPath;
  }

  // Return undefined if the file is not found in either location
  return undefined;
}

export async function readConfig<T>(
  pathFragment: string,
  workspaceRoot: string
): Promise<T | undefined> {
  const filePath = await getConfigFilePath(pathFragment, workspaceRoot);
  if (filePath) {
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  } else {
    return undefined;
  }
}
