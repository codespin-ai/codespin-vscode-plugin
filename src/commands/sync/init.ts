import { ExtensionContext } from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { keepAlive } from "./keepAlive.js";
import { registerProject } from "./register.js";
import { connectWebSocket } from "./connectWebSocket.js";

export function init(context: ExtensionContext) {
  setTimeout(() => {
    registerProject(getWorkspaceRoot(context));

    setInterval(() => {
      keepAlive(getWorkspaceRoot(context));
    }, 30000);

    connectWebSocket(context);
  }, 1000);
}
