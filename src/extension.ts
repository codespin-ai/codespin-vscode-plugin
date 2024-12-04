// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { EventEmitter } from "events";
import { getStartChatCommand } from "./commands/codegen/startChat.js";
import { getIncludeFilesCommand } from "./commands/codegen/includeFiles.js";
import { getInitCommand } from "./commands/init/command.js";
import { ConversationsViewProvider } from "./ui/conversations/ConversationsViewProvider.js";
import { getOpenConversationCommand } from "./commands/openConversation/index.js";

const globalEventEmitter = new EventEmitter();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  process.on("exit", () => {
    deactivate();
  });

  const conversationsProvider = new ConversationsViewProvider(
    context,
    globalEventEmitter
  );
  conversationsProvider.init();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "codespin-ai.conversations",
      conversationsProvider
    )
  );

  const startChatCommand = vscode.commands.registerCommand(
    "codespin-ai.startChat",
    getStartChatCommand(context, globalEventEmitter)
  );

  context.subscriptions.push(startChatCommand);

  const initCommand = vscode.commands.registerCommand(
    "codespin-ai.init",
    getInitCommand(context)
  );

  context.subscriptions.push(initCommand);

  const includeFilesCommand = getIncludeFilesCommand(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codespin-ai.includeFiles",
      includeFilesCommand
    )
  );

  const openConversationCommand = getOpenConversationCommand(
    context,
    globalEventEmitter
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codespin-ai.openConversation",
      openConversationCommand
    )
  );
}

// This method is called when your extension is deactivated
function deactivate() {}
