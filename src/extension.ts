// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { EventEmitter } from "events";
import { getGenerateCommand } from "./commands/codegen/generate.js";
import { getIncludeFilesCommand } from "./commands/codegen/includeFiles.js";
import { getSelectHistoryEntryCommand } from "./commands/history/command.js";
import { getInitCommand } from "./commands/init/command.js";
import { HistoryViewProvider } from "./ui/viewProviders/history/HistoryViewProvider.js";

const globalEventEmitter = new EventEmitter();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  process.on("exit", () => {
    deactivate();
  });

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
function deactivate() {}
