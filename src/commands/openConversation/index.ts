import * as vscode from "vscode";
import { EventEmitter } from "events";
import { ChatPanel } from "../../ui/chat/ChatPanel.js";
import { getConversation } from "../../conversations/getConversation.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { handleOpenChat } from "../../ui/chat/handlers/handleOpenChat.js";

export function getOpenConversationCommand(
  context: vscode.ExtensionContext,
  globalEventEmitter: EventEmitter
) {
  return async function openConversationCommand(
    conversationId: string
  ): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);
    const conversation = await getConversation(
      { id: conversationId },
      workspaceRoot
    );

    if (!conversation) {
      vscode.window.showErrorMessage("Could not load conversation");
      return;
    }

    const panel = new ChatPanel(context, globalEventEmitter);

    await panel.webviewReadyEvent();

    handleOpenChat(
      panel,
      {
        type: "openChat",
        conversation,
        isNew: false,
      },
      workspaceRoot
    );
  };
}
