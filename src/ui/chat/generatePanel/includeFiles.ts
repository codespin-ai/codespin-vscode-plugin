import { promises as fs } from "fs";
import * as path from "path";
import { GeneratePanel } from "./GeneratePanel.js";
import { IncludeFilesEvent } from "./types.js";
import { GeneratePageBrokerType } from "../html/pages/generate/getMessageBroker.js";
import { createMessageClient } from "../../../messaging/messageClient.js";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";

export async function includeFiles(
  generatePanel: GeneratePanel,
  filePaths: string[],
  workspaceRoot: string
) {
  const generatePageMessageClient = createMessageClient<GeneratePageBrokerType>(
    (message: unknown) => {
      generatePanel.panel.webview.postMessage(message);
    }
  );

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

  generatePageMessageClient.send("includeFiles", message);
}
