import * as vscode from "vscode";
import { EventTemplate } from "./EventTemplate.js";
import { UIContainer } from "./UIContainer.js";

export function getMessageHandler(uiContainer: UIContainer) {
  return function onDidReceiveMessageBase(message: EventTemplate) {
    if (message.type.startsWith("command:")) {
      const command = message.type.split(":")[1];
      const args = (message as EventTemplate<string, { args: unknown[] }>).args;
      vscode.commands.executeCommand(command, ...args);
    } else {
      switch (message.type) {
        case "webviewReady":
          uiContainer.waitUntilWebviewIsReady();
          break;
      }
    }

    uiContainer.onMessage(message);
  };
}
