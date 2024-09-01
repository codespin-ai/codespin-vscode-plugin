import { ExtensionContext } from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import * as ws from "ws";
import { SyncCodeData, SyncData } from "./types.js";

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

  webSocket.onopen = () => {
    console.log(`Connected to WebSocket server`);
  };

  webSocket.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
    const data = JSON.parse(event.data.toString()) as SyncData;
    if (data.type === "code") {
      const codeData = data as SyncCodeData;
      // Are we getting messages for another project? (Maybe we reloaded the project)
      if (codeData.projectPath !== getWorkspaceRoot(context)) {
        reconnectWebSocket(context);
      }
      // All ok
      else {
        console.log({
          codeData,
        });
      }
    }
  };

  webSocket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
  };

  webSocket.onclose = () => {
    console.log("WebSocket connection closed. Attempting to reconnect...");
    setTimeout(() => connectWebSocket(context), 5000); // Try to reconnect every 5 seconds
  };

  // Store the current WebSocket connection
  currentWebSocket = webSocket;
}

// Function to reconnect WebSocket when projectPath changes
export function reconnectWebSocket(context: ExtensionContext) {
  console.log("Reconnecting WebSocket due to projectPath change...");
  connectWebSocket(context);
}
