import * as vscode from "vscode";
import { UIPanel } from "../../ui/UIPanel.js";
import { SelectHistoryEntryArgs } from "./SelectHistoryEntryArgs.js";
import { getFullHistoryEntry } from "../../settings/history/getHistoryEntry.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { HistoryEntryPageArgs } from "../../ui/pages/history/HistoryEntryPageArgs.js";

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

    const workspaceRoot = await getWorkspaceRoot(context);
    const historyEntryDetails = await getFullHistoryEntry(
      args.itemId,
      workspaceRoot
    );

    const pageArgs: HistoryEntryPageArgs = {
      entry: historyEntryDetails,
    };

    await uiPanel.navigateTo("/history/entry", pageArgs);

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
