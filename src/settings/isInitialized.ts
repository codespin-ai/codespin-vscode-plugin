import { pathExists } from "../fs/pathExists.js";
import { getCodeSpinDir } from "./codespinDirs.js";

export async function isInitialized(workspaceRoot: string) {
  const codespinDir = getCodeSpinDir(workspaceRoot);
  return await pathExists(codespinDir);
}
