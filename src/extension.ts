// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { getGenerateCommand } from "./commands/generate/command.js";
import { getInitCommand } from "./commands/init/command.js";
import { HistoryViewProvider } from "./ui/HistoryViewProvider.js";
import { SettingsViewProvider } from "./ui/SettingsViewProvider.js";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const historyProvider = new HistoryViewProvider(context.extensionUri);
  const settingsProvider = new SettingsViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "codespin-ai.history",
      historyProvider
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "codespin-ai.settings",
      settingsProvider
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
}

// This method is called when your extension is deactivated
export function deactivate() {}
