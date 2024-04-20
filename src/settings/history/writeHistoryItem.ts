import { promises as fs } from "fs";
import * as path from "path";
import { getHistoryDir } from "../codespinDirs.js";

export async function writeHistoryItem(
  content: string,
  filename: string,
  dirName: string,
  workspaceRoot: string
) {
  const historyDir = getHistoryDir(workspaceRoot);
  const filePath = path.join(historyDir, dirName, filename);

  await fs.mkdir(path.dirname(filePath), {
    recursive: true,
  });

  await fs.writeFile(filePath, content);
}
