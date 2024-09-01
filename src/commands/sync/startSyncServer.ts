import { spawn } from "child_process";
import { syncIsInstalled } from "./syncIsInstalled.js";

// Function to start the sync server
export function startSyncServer() {
  if (syncIsInstalled()) {
    const serverProcess = spawn("codespin-sync-server", [], {
      stdio: "inherit",
    });

    serverProcess.on("error", (error) => {
      console.error("Failed to start process:", error);
    });

    serverProcess.on("close", (code) => {
      console.log(`Codespin sync server process exited with code ${code}`);
    });
  }
}
