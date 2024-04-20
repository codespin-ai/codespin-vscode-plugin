import * as path from "path";
import { getHistoryDir } from "../codespinDirs.js";

export function getHistoryItemDir(dirName: string, workspaceRoot: string) {
  const historyDir = getHistoryDir(workspaceRoot);
  const filePath = path.join(historyDir, dirName);
  return filePath;
}
