// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { generate } from "./commands/generate.js";
import { generateFromCommit } from "./commands/generateFromCommit.js";
import { generateWithPromptDiff } from "./commands/generateWithPromptDiff.js";
import { createPromptFile } from "./commands/createPromptFile.js";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const generateCommand = vscode.commands.registerCommand(
    "codespin-ai.generate",
    generate
  );

  context.subscriptions.push(generateCommand);

  const generateFromCommitCommand = vscode.commands.registerCommand(
    "codespin-ai.generateFromCommit",
    generateFromCommit
  );

  context.subscriptions.push(generateFromCommitCommand);

  const generateWithPromptDiffCommand = vscode.commands.registerCommand(
    "codespin-ai.generateWithPromptDiff",
    generateWithPromptDiff
  );

  context.subscriptions.push(generateWithPromptDiffCommand);

  const createPromptFileCommand = vscode.commands.registerCommand(
    "codespin-ai.createPromptFile",
    createPromptFile
  );

  context.subscriptions.push(createPromptFileCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
