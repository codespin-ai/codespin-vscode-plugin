import { ExtensionContext } from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import * as ws from "ws";
import { SyncCodeData, SyncData } from "./types.js";
import * as path from "path";
import { writeFile, mkdir } from "fs/promises";
import { SYNC_SERVER_PORT } from "../../constants.js";

let currentWebSocket: ws.WebSocket | null = null;

export function connectWebSocket(workspaceRoot: string) {
  // Close any existing WebSocket connection before establishing a new one
  if (currentWebSocket) {
    currentWebSocket.close();
  }

  const webSocket = new ws.WebSocket(
    `ws://localhost:${SYNC_SERVER_PORT}/sync?projectPath=${encodeURIComponent(workspaceRoot)}`
  );

  webSocket.onopen = () => {};

  webSocket.onmessage = async (event) => {
    const data = JSON.parse(event.data.toString()) as SyncData;
    if (data.type === "code") {
      const codeData = data as SyncCodeData;
      // Are we getting messages for another project? (Maybe we reloaded the project)
      if (codeData.projectPath !== workspaceRoot) {
        connectWebSocket(workspaceRoot);
      } else {
        // Write out the files
        if (
          codeData.filePath.startsWith("./") &&
          !codeData.filePath.includes("..")
        ) {
          const outputPath = path.join(workspaceRoot, codeData.filePath);
          const outputDir = path.dirname(outputPath);
          await mkdir(outputDir, { recursive: true });
          await writeFile(outputPath, codeData.contents);
        }
      }
    }
  };

  webSocket.onerror = (error) => {};

  webSocket.onclose = () => {
    setTimeout(() => connectWebSocket(workspaceRoot), 5000); // Try to reconnect every 5 seconds
  };

  // Store the current WebSocket connection
  currentWebSocket = webSocket;
}
