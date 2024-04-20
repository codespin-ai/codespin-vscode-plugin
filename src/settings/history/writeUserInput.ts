import { promises as fs } from "fs";
import * as path from "path";
import { GenerateUserInput } from "../../ui/panels/generate/types.js";
import { getHistoryDir } from "../codespinDirs.js";

export async function writeUserInput(
  dirName: string,
  userInput: GenerateUserInput,
  workspaceRoot: string
) {
  const historyDir = getHistoryDir(workspaceRoot);
  const filePath = path.join(historyDir, dirName, "user-input.json");

  await fs.mkdir(path.dirname(filePath), {
    recursive: true,
  });

  await fs.writeFile(filePath, JSON.stringify(userInput, null, 2));
}
