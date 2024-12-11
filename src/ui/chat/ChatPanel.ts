import { EventEmitter } from "events";
import * as vscode from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { UIPanel } from "../UIPanel.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { MessageTemplate } from "../types.js";

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
    this.setIncludeFilesContext(true);
  }

  async onMessage(message: MessageTemplate) {
    if (this.messageBroker.canHandle(message.type)) {
      const result = await this.messageBroker.handleRequest(message as any);
      this.getWebview().postMessage(result);
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
