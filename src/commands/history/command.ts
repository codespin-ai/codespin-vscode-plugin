import * as vscode from "vscode";
import { HistoryEntryPanel } from "../../ui/panels/historyEntry/HistoryEntryPanel.js";
import { EventEmitter } from "events";
import { validateConfig } from "../../config/validateConfig.js";

export type SelectHistoryEntryArgs = {
  itemId: string;
};

export type SelectHistoryEntryCommandEvent = {
  type: "command:codespin-ai.selectHistoryEntry";
  args: SelectHistoryEntryArgs[];
};

export function getSelectHistoryEntryCommand(
  context: vscode.ExtensionContext,
  globalEventEmitter: EventEmitter
) {
  return async function selectHistoryItemCommand(
    args: SelectHistoryEntryArgs
  ): Promise<void> {
    if (!(await validateConfig(context))) {
      return;
    }

    if (!args.itemId) {
      vscode.window.showErrorMessage("No history item ID provided.");
      return;
    }

    const panel = new HistoryEntryPanel(context, globalEventEmitter);
    await panel.init(args);
  };
}
