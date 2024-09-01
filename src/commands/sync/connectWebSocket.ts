import { ExtensionContext } from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import * as ws from "ws";
import { SyncCodeData, SyncData } from "./types.js";
import * as path from "path";
import { writeFile, mkdir } from "fs/promises";

let currentWebSocket: ws.WebSocket | null = null;

export function connectWebSocket(context: ExtensionContext) {
  const projectPath = getWorkspaceRoot(context);

  // Close any existing WebSocket connection before establishing a new one
  if (currentWebSocket) {
    currentWebSocket.close();
  }

  const webSocket = new ws.WebSocket(
    `ws://localhost:60280/sync?projectPath=${encodeURIComponent(projectPath)}`
  );

  webSocket.onopen = () => {};

  webSocket.onmessage = async (event) => {
    const data = JSON.parse(event.data.toString()) as SyncData;
    if (data.type === "code") {
      const codeData = data as SyncCodeData;
      // Are we getting messages for another project? (Maybe we reloaded the project)
      if (codeData.projectPath !== getWorkspaceRoot(context)) {
        reconnectWebSocket(context);
      } else {
        // Write out the files
        if (
          codeData.filePath.startsWith("./") &&
          !codeData.filePath.includes("..")
        ) {
          const outputPath = path.join(projectPath, codeData.filePath);
          const outputDir = path.dirname(outputPath);
          await mkdir(outputDir, { recursive: true });
          await writeFile(outputPath, codeData.contents);
        }
      }
    }
  };

  webSocket.onerror = (error) => {};

  webSocket.onclose = () => {
    setTimeout(() => connectWebSocket(context), 5000); // Try to reconnect every 5 seconds
  };

  // Store the current WebSocket connection
  currentWebSocket = webSocket;
}

// Function to reconnect WebSocket when projectPath changes
export function reconnectWebSocket(context: ExtensionContext) {
  connectWebSocket(context);
}
