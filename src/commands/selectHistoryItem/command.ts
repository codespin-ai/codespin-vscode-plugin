import * as vscode from "vscode";
import { UIPanel } from "../../ui/UIPanel.js";
import { SelectHistoryItemArgs } from "./SelectHistoryItemArgs.js";

export function getSelectHistoryItemCommand(context: vscode.ExtensionContext) {
  return async function selectHistoryItemCommand(
    args: SelectHistoryItemArgs
  ): Promise<void> {
    if (!args.itemId) {
      vscode.window.showErrorMessage("No history item ID provided.");
      return;
    }

    const uiPanel = new UIPanel(context, onMessage);
    await uiPanel.onWebviewReady();

    const historyItemDetails = {
      id: args.itemId,
    };

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
