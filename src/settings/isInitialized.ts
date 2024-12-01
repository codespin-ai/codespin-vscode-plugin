import { pathExists } from "../fs/pathExists.js";
import { getCodeSpinDir, getCodingConventionsDir } from "./codespinDirs.js";
import * as path from "path";

export async function isInitialized(workspaceRoot: string): Promise<boolean> {
  const codespinDir = getCodeSpinDir(workspaceRoot);
  const conventionsDir = getCodingConventionsDir(workspaceRoot);
  const conversationsDir = path.join(
    getCodeSpinDir(workspaceRoot),
    "conversations"
  );

  const [codespinExists, conventionsExists, conversationsExists] =
    await Promise.all([
      pathExists(codespinDir),
      pathExists(conventionsDir),
      pathExists(conversationsDir),
    ]);

  return codespinExists && conventionsExists && conversationsExists;
}
