import * as vscode from "vscode";
import { UIPanel } from "../../ui/UIPanel.js";
import { SelectHistoryEntryArgs } from "./SelectHistoryEntryArgs.js";

export function getSelectHistoryEntryCommand(context: vscode.ExtensionContext) {
  return async function selectHistoryItemCommand(
    args: SelectHistoryEntryArgs
  ): Promise<void> {
    if (!args.itemId) {
      vscode.window.showErrorMessage("No history item ID provided.");
      return;
    }

    const uiPanel = new UIPanel(context, onMessage);
    await uiPanel.onWebviewReady();

    // Todo: fill this up...
    const historyItemDetails = {};

    await uiPanel.navigateTo("/history/item", historyItemDetails);

    async function onMessage(message: any) {
      switch (message.type) {
        case "historyItemAction":
          break;
        default:
          console.log("Unhandled message type from webview:", message.type);
          break;
      }
    }
  };
}
