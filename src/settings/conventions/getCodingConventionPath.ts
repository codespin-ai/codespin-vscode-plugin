import * as path from "path";
import { getCodingConventionsDir } from "../codespinDirs.js";

export function getCodingConventionPath(
  filename: string,
  workspaceRoot: string
) {
  const conventionsDir = getCodingConventionsDir(workspaceRoot);
  return path.join(conventionsDir, filename);
}
