import { clearInterval } from "timers";
import { connectWebSocket } from "./connectWebSocket.js";
import { keepAlive } from "./keepAlive.js";
import { registerProject } from "./register.js";
import { startSyncServer } from "./startSyncServer.js";

let interval: NodeJS.Timeout | undefined = undefined;

export function init(workspaceRoot: string) {
  if (interval) {
    clearInterval(interval);
  }

  startSyncServer();

  setTimeout(() => {
    registerProject(workspaceRoot);

    interval = setInterval(() => {
      keepAlive(workspaceRoot);
    }, 30000);

    connectWebSocket(workspaceRoot);
  }, 1000);
}
