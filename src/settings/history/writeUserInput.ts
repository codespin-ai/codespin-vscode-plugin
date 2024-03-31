import { promises as fs } from "fs";
import * as path from "path";
import { getHistoryDir } from "../codespinDirs.js";
import { ArgsFromGeneratePanel } from "../../commands/generate/ArgsFromGeneratePanel.js";

export async function writeUserInput(
  dirName: string,
  userInput: ArgsFromGeneratePanel,
  workspaceRoot: string
) {
  const historyDir = await getHistoryDir(workspaceRoot);
  const filePath = path.join(historyDir, dirName, "user-input.json");

  await fs.mkdir(path.dirname(filePath), {
    recursive: true,
  });

  await fs.writeFile(filePath, JSON.stringify(userInput, null, 2));
}
