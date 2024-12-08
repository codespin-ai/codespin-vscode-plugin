import { EventEmitter } from "events";
import * as vscode from "vscode";
import { listConversations } from "../../conversations/listConversations.js";
import { initialize } from "../../settings/initialize.js";
import { isInitialized } from "../../settings/isInitialized.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ViewProvider } from "../ViewProvider.js";
import { MessageTemplate } from "../types.js";
import { createConversationsNavigator } from "./createConversationsNavigator.js";
import { UpdateConversationsEvent } from "./types.js";

export class ConversationsViewProvider extends ViewProvider {
  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    const webviewOptions = {};
    super(webviewOptions, context, globalEventEmitter);
  }

  async init() {
    await this.initializeEvent();
    await this.webviewReadyEvent();
  }

  async onMessage(message: MessageTemplate) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    const navigate = createConversationsNavigator(this);

    switch (message.type) {
      case "webviewReady": {
        const initialized = await isInitialized(workspaceRoot);

        if (initialized) {
          const entries = await listConversations(workspaceRoot);
          await navigate("/conversations", { entries });
        } else {
          await navigate("/initialize");
        }
        break;
      }
      case "newConversation": {
        const updateConversationsEvent: UpdateConversationsEvent = {
          type: "updateConversations",
          entries: await listConversations(workspaceRoot),
        };

        const webview = this.getWebview();
        if (webview) {
          webview.postMessage(updateConversationsEvent);
        }
        break;
      }
      case "initialize": {
        await initialize(false, workspaceRoot);
        const entries = await listConversations(workspaceRoot);
        await navigate("/conversations", { entries });
        break;
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
