import { pathExists } from "../fs/pathExists.js";
import { getCodespinDir } from "./codespinDirs.js";

export async function isInitialized(workspaceRoot: string) {
  const codespinDir = getCodespinDir(workspaceRoot);
  return await pathExists(codespinDir);
}
