// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { getGenerate } from "./commands/generate.js";
import { getGenerateFromLastCommit } from "./commands/generateFromLastCommit.js";
import { getGenerateWithPromptDiff } from "./commands/generateWithPromptDiff.js";
import { getCreatePromptFile } from "./commands/createPromptFile.js";
import { getQuickPrompt } from "./commands/quickPrompt.js";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const generateCommand = vscode.commands.registerCommand(
    "codespin-ai.generate",
    getGenerate(context)
  );

  context.subscriptions.push(generateCommand);

  const generateFromLastCommitCommand = vscode.commands.registerCommand(
    "codespin-ai.generateFromLastCommit",
    getGenerateFromLastCommit(context)
  );

  context.subscriptions.push(generateFromLastCommitCommand);

  const generateWithPromptDiffCommand = vscode.commands.registerCommand(
    "codespin-ai.generateWithPromptDiff",
    getGenerateWithPromptDiff(context)
  );

  context.subscriptions.push(generateWithPromptDiffCommand);

  const createPromptFileCommand = vscode.commands.registerCommand(
    "codespin-ai.createPromptFile",
    getCreatePromptFile(context)
  );

  context.subscriptions.push(createPromptFileCommand);

  const quickPromptCommand = vscode.commands.registerCommand(
    "codespin-ai.quickPrompt",
    getQuickPrompt(context)
  );

  context.subscriptions.push(quickPromptCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
