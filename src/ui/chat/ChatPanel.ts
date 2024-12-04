import { EventEmitter } from "events";
import * as vscode from "vscode";
import { getConventions } from "../../settings/conventions/getCodingConventions.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { navigateTo } from "../navigateTo.js";
import { MessageTemplate } from "../types.js";
import { UIPanel } from "../UIPanel.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { getStartChatPageArgs } from "./getStartChatPageArgs.js";
import { StartChatPageArgs } from "./html/pages/start/StartChatPageArgs.js";
import { StartChatEvent } from "./types.js";
import { Conversation } from "../../conversations/types.js";
import { createMessageClient } from "../../messaging/messageClient.js";
import { ChatPageBrokerType } from "./html/pages/chat/getMessageBroker.js";

export type StartChatPageInitArgs = {
  type: "files";
  prompt: string | undefined;
  args: string[];
};

export type ContinueChatPageInitArgs = {
  type: "existingConversation";
  conversation: Conversation;
};

export type InitArgs = StartChatPageInitArgs | ContinueChatPageInitArgs;

let activePanel: ChatPanel | undefined = undefined;

export function getActivePanel() {
  return activePanel;
}

export class ChatPanel extends UIPanel {
  userInput: StartChatEvent | undefined;
  cancelGeneration: (() => void) | undefined;
  messageBroker: ReturnType<typeof getMessageBroker>;

  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    super({}, context, globalEventEmitter);
    const workspaceRoot = getWorkspaceRoot(context);
    this.messageBroker = getMessageBroker(this, workspaceRoot);
  }

  async init(initArgs: InitArgs) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    await this.webviewReadyEvent();

    if (initArgs.type === "existingConversation") {
      const [provider] = initArgs.conversation.model.split(":");
      const args = {
        provider,
        model: initArgs.conversation.model,
      };

      const chatPageMessageClient = createMessageClient<ChatPageBrokerType>(
        (message) => {
          this.getWebview().postMessage(message);
        }
      );

      await navigateTo(this, "/chat", args);

      // Send initial messages to populate chat
      chatPageMessageClient.send("messages", initArgs.conversation.messages);
    } else {
      const conventions = await getConventions(workspaceRoot);
      const startChatPageArgs: StartChatPageArgs = await getStartChatPageArgs(
        initArgs,
        workspaceRoot,
        conventions
      );
      await navigateTo(this, "/start", startChatPageArgs);
    }
  }

  async onMessage(message: MessageTemplate) {
    if (this.messageBroker.canHandle(message.type)) {
      this.messageBroker.handleRequest(message as any);
    }
  }

  onDidChangeViewState(e: vscode.WebviewPanelOnDidChangeViewStateEvent): void {
    this.setIncludeFilesContext(e.webviewPanel.visible);
  }

  setIncludeFilesContext(visible: boolean) {
    if (visible) {
      activePanel = this;
    } else {
      if (activePanel === this) {
        activePanel = undefined;
      }
    }

    // Set the context key to control visibility of the context menu item
    vscode.commands.executeCommand(
      "setContext",
      "codespin-ai.enableIncludeFiles",
      activePanel !== undefined
    );
  }

  onDispose(): void {
    this.setIncludeFilesContext(false);
  }

  getJSFile(): string {
    return "chat.js";
  }

  getCssFile(): string {
    return "chat.css";
  }
}
