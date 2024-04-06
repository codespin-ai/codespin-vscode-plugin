import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import * as vscode from "vscode";
import { getFullHistoryEntry } from "../../settings/history/getHistoryEntry.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { UIPanel } from "../../ui/panels/UIPanel.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { SelectHistoryEntryArgs } from "../../ui/panels/historyEntry/SelectHistoryEntryArgs.js";
import { HistoryEntryPageArgs } from "../../ui/html/pages/history/HistoryEntryPageArgs.js";
import { HistoryEntryPanel } from "../../ui/panels/historyEntry/HistoryEntryPanel.js";

export function getSelectHistoryEntryCommand(context: vscode.ExtensionContext) {
  return async function selectHistoryItemCommand(
    args: SelectHistoryEntryArgs
  ): Promise<void> {
    if (!args.itemId) {
      vscode.window.showErrorMessage("No history item ID provided.");
      return;
    }

    const panel = new HistoryEntryPanel(context);
    await panel.init(args);
  };
}
