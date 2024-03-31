import { pathExists } from "../fs/pathExists.js";
import { getCodespinDir } from "./codespinDirs.js";

export async function isInitialized(workspaceRoot: string) {
  const codespinDir = await getCodespinDir(workspaceRoot);
  return await pathExists(codespinDir);
}
