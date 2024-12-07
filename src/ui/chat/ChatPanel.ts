import { EventEmitter } from "events";
import * as vscode from "vscode";
import { Conversation } from "../../conversations/types.js";
import { getConventions } from "../../settings/conventions/getCodingConventions.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { navigateTo } from "../navigateTo.js";
import { MessageTemplate } from "../types.js";
import { UIPanel } from "../UIPanel.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { getStartChatPageArgs } from "./getStartChatPageArgs.js";
import { StartChatPageArgs } from "./html/pages/start/StartChatPageArgs.js";

// Simplified init args - we only need the conversation or start chat args
export type ChatPageInitArgs = {
  type: "existingConversation";
  conversation: Conversation;
};

export type StartChatPageInitArgs = {
  type: "newConversation";
  prompt: string | undefined;
  args: string[];
};

export type InitArgs = StartChatPageInitArgs | ChatPageInitArgs;

let activePanel: ChatPanel | undefined = undefined;

export function getActivePanel() {
  return activePanel;
}

export class ChatPanel extends UIPanel {
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
      await navigateTo(this, "/chat", {
        conversation: initArgs.conversation,
      });
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
