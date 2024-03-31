// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { getGenerateCommand } from "./commands/generate/command.js";
import { getInitCommand } from "./commands/init/command.js";
import { HistoryViewProvider } from "./viewProviders/history/HistoryViewProvider.js";
import { getSelectHistoryEntryCommand } from "./commands/selectHistoryEntry/command.js";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const historyProvider = new HistoryViewProvider(context);
  historyProvider.init();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "codespin-ai.history",
      historyProvider
    )
  );

  const generateCommand = vscode.commands.registerCommand(
    "codespin-ai.generate",
    getGenerateCommand(context)
  );

  context.subscriptions.push(generateCommand);

  const initCommand = vscode.commands.registerCommand(
    "codespin-ai.init",
    getInitCommand(context)
  );

  context.subscriptions.push(initCommand);

  const selectHistoryEntryCommand = vscode.commands.registerCommand(
    "codespin-ai.selectHistoryEntry",
    getSelectHistoryEntryCommand(context)
  );

  context.subscriptions.push(selectHistoryEntryCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
