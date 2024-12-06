import * as vscode from "vscode";
import { UIContainer } from "./UIContainer.js";
import { MessageTemplate } from "./types.js";
import type { NavigateEvent } from "./navigateTo.js";

export function getMessageHandler(uiContainer: UIContainer) {
  return function onDidReceiveMessageBase(message: MessageTemplate) {
    if (message.type.startsWith("command:")) {
      const command = message.type.split(":")[1];
      const args = (message as MessageTemplate<string, { args: unknown[] }>)
        .args;
      vscode.commands.executeCommand(command, ...args);
    } else {
      switch (message.type) {
        case "webviewReady":
          uiContainer.webviewReadyPromiseResolve();
          break;
        case "navigated":
          const incomingMessage = message as NavigateEvent;
          const resolver = uiContainer.navigationPromiseResolvers.get(
            incomingMessage.url
          );
          if (resolver) {
            resolver();
            uiContainer.navigationPromiseResolvers.delete(incomingMessage.url);
          }
          break;
      }
    }

    uiContainer.onMessage(message);
  };
}
