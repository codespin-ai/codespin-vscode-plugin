import { promises as fs } from "fs";
import * as path from "path";
import { getHistoryDir } from "../codespinDirs.js";

export async function writePrompt(
  dirName: string,
  prompt: string,
  workspaceRoot: string
) {
  const historyDir = await getHistoryDir(workspaceRoot);
  const promptPath = path.join(historyDir, dirName, "prompt.txt");

  await fs.mkdir(path.dirname(promptPath), {
    recursive: true,
  });

  await fs.writeFile(promptPath, prompt);
}
