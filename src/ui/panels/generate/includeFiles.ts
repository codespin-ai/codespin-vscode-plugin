import { promises as fs } from "fs";
import * as path from "path";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { GeneratePanel } from "./GeneratePanel.js";
import { IncludeFilesEvent } from "./types.js";

export async function includeFiles(
  generatePanel: GeneratePanel,
  filePaths: string[],
  workspaceRoot: string
) {
  const allPaths = await getFilesRecursive(filePaths, workspaceRoot);

  const message: IncludeFilesEvent = {
    type: "includeFiles",
    files: await Promise.all(
      allPaths.map(async (filePath) => ({
        path: path.relative(workspaceRoot, filePath),
        size: (await fs.stat(path.resolve(workspaceRoot, filePath))).size,
      }))
    ),
  };

  generatePanel.panel.webview.postMessage(message);
}
