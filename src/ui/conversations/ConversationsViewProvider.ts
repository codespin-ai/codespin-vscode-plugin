import { EventEmitter } from "events";
import * as vscode from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ViewProvider } from "../ViewProvider.js";
import { MessageTemplate } from "../types.js";
import { getMessageBroker } from "./getMessageBroker.js";

export class ConversationsViewProvider extends ViewProvider {
  messageBroker: ReturnType<typeof getMessageBroker>;

  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    const webviewOptions = {};
    super(webviewOptions, context, globalEventEmitter);
    const workspaceRoot = getWorkspaceRoot(context);
    this.messageBroker = getMessageBroker(this, workspaceRoot);
  }

  async init() {
    await this.initializeEvent();
    await this.webviewReadyEvent();
  }

  async onMessage(message: MessageTemplate) {
    if (this.messageBroker.canHandle(message.type)) {
      const result = await this.messageBroker.handleRequest(message as any);
      const webview = this.getWebview();
      if (webview && result) {
        webview.postMessage(result);
      }
    }
  }

  getJSFile(): string {
    return "conversations.js";
  }

  getCssFile(): string {
    return "conversations.css";
  }
}
