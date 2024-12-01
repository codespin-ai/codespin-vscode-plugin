import { EventEmitter } from "events";
import * as vscode from "vscode";
import { listConversations } from "../../conversations/listConversations.js";
import { initialize } from "../../settings/initialize.js";
import { isInitialized } from "../../settings/isInitialized.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ViewProvider } from "../ViewProvider.js";
import { MessageTemplate } from "../types.js";
import { ConversationsPageArgs } from "./html/pages/conversations/Conversations.js";
import { UpdateConversationsEvent } from "./types.js";
import { navigateTo } from "../navigateTo.js";

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
    switch (message.type) {
      case "webviewReady": {
        const initialized = await isInitialized(workspaceRoot);

        if (initialized) {
          const conversationsPageArgs: ConversationsPageArgs = {
            entries: initialized
              ? await listConversations({ workspaceRoot })
              : [],
          };

          navigateTo(this, "/conversations", conversationsPageArgs);
        } else {
          navigateTo(this, "/initialize");
        }
        break;
      }
      case "newConversation": {
        const updateConversationsEvent: UpdateConversationsEvent = {
          type: "updateConversations",
          entries: await listConversations({ workspaceRoot }),
        };

        const webview = this.getWebview();

        if (webview) {
          webview.postMessage(updateConversationsEvent);
        }

        break;
      }
      case "initialize": {
        await initialize(false, workspaceRoot);

        const conversationsPageArgs: ConversationsPageArgs = {
          entries: await listConversations({ workspaceRoot }),
        };

        navigateTo(this, "/conversations", conversationsPageArgs);

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
