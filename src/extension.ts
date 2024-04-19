// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { getGenerateCommand } from "./commands/codegen/generate.js";
import { getInitCommand } from "./commands/init/command.js";
import { getSelectHistoryEntryCommand } from "./commands/history/command.js";
import { HistoryViewProvider } from "./ui/viewProviders/history/HistoryViewProvider.js";
import { getIncludeFilesCommand } from "./commands/codegen/includeFiles.js";
import { EventEmitter } from "events";

const globalEventEmitter = new EventEmitter();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const historyProvider = new HistoryViewProvider(context, globalEventEmitter);
  historyProvider.init();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "codespin-ai.history",
      historyProvider
    )
  );

  const generateCommand = vscode.commands.registerCommand(
    "codespin-ai.generate",
    getGenerateCommand(context, globalEventEmitter)
  );

  context.subscriptions.push(generateCommand);

  const initCommand = vscode.commands.registerCommand(
    "codespin-ai.init",
    getInitCommand(context)
  );

  context.subscriptions.push(initCommand);

  const selectHistoryEntryCommand = vscode.commands.registerCommand(
    "codespin-ai.selectHistoryEntry",
    getSelectHistoryEntryCommand(context, globalEventEmitter)
  );

  context.subscriptions.push(selectHistoryEntryCommand);

  let includeFilesCommand = getIncludeFilesCommand(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codespin-ai.includeFiles",
      includeFilesCommand
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
