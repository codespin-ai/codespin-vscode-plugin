import { spawn } from "child_process";
import { syncIsInstalled } from "./syncIsInstalled.js";
import * as net from "net";
import { SYNC_SERVER_PORT } from "../../constants.js";

// Function to check if port is in use
function isPortInUse(port: number, callback: (inUse: boolean) => void) {
  const server = net.createServer();

  server.once("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      callback(true);
    } else {
      callback(false);
    }
  });

  server.once("listening", () => {
    server.close();
    callback(false);
  });

  server.listen(port);
}

// Function to start the sync server
export function startSyncServer() {
  isPortInUse(SYNC_SERVER_PORT, (inUse) => {
    if (inUse) {
      console.log(
        `Port ${SYNC_SERVER_PORT} is already in use. Sync server will not be started.`
      );
    } else if (syncIsInstalled()) {
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
  });
}
