import { exec } from "child_process";
import * as vscode from "vscode";
import { syncIsInstalled } from "./syncIsInstalled.js";

// Function to start the sync server
export function startSyncServer() {
  if (syncIsInstalled()) {
    const serverProcess = exec(
      "codespin-sync-server",
      (error, stdout, stderr) => {}
    );
  }
}
