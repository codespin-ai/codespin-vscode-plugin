import { EventTemplate } from "./EventTemplate.js";
import { UIContainer } from "./UIContainer.js";
import { NavigateEvent } from "./types.js";
import * as vscode from "vscode";

export function getMessageHandler(uiContainer: UIContainer) {
  return function onDidReceiveMessageBase(message: EventTemplate) {
    if (message.type.startsWith("command:")) {
      const command = message.type.split(":")[1];
      const args = (message as EventTemplate<string, { args: unknown[] }>).args;
      vscode.commands.executeCommand(command, ...args);
    } else {
      switch (message.type) {
        case "webviewReady":
          uiContainer.resolveWebviewReady();
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
