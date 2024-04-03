import * as path from "path";
import { getCodingConventionsDir } from "../codespinDirs.js";

export async function getCodingConventionPath(
  filename: string,
  workspaceRoot: string
) {
  const conventionsDir = await getCodingConventionsDir(workspaceRoot);
  return path.join(conventionsDir, filename);
}
