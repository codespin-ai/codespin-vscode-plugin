import { promises as fs } from "fs";
import * as path from "path";
import { ChatPanel } from "./ChatPanel.js";
import { IncludeFilesEvent } from "./types.js";
import { StartChatPageBrokerType } from "./html/pages/start/getMessageBroker.js";
import { createMessageClient } from "../../messaging/messageClient.js";
import { getFilesRecursive } from "../../fs/getFilesRecursive.js";

export async function includeFiles(
  chatPanel: ChatPanel,
  filePaths: string[],
  workspaceRoot: string
) {
  const startChatPageMessageClient =
    createMessageClient<StartChatPageBrokerType>((message: unknown) => {
      chatPanel.panel.webview.postMessage(message);
    });

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

  startChatPageMessageClient.send("includeFiles", message);
}
