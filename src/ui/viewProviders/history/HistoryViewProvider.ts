import * as vscode from "vscode";
import { getHistory } from "../../../settings/history/getHistory.js";
import { initialize } from "../../../settings/initialize.js";
import { isInitialized } from "../../../settings/isInitialized.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { ViewProvider } from "../ViewProvider.js";
import { HistoryPageArgs } from "../../html/pages/history/History.js";
import { UpdateHistoryEvent } from "./types.js";
import { EventEmitter } from "events";

export class HistoryViewProvider extends ViewProvider {
  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    super(context, globalEventEmitter);
  }

  async init() {
    await this.onInitialize();
    await this.onWebviewReady();
  }

  async onMessage(data: EventTemplate) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    switch (data.type) {
      case "webviewReady": {
        const initialized = await isInitialized(workspaceRoot);

        if (initialized) {
          const historyPageArgs: HistoryPageArgs = {
            entries: initialized ? await getHistory(workspaceRoot) : [],
          };

          this.navigateTo("/history", historyPageArgs);
        } else {
          this.navigateTo("/initialize");
        }
        break;
      }
      case "generate": {
        const updateHistoryEvent: UpdateHistoryEvent = {
          type: "updateHistory",
          entries: await getHistory(workspaceRoot),
        };

        this.postMessageToWebview(updateHistoryEvent);
        break;
      }
      case "initialize": {
        await initialize(false, workspaceRoot);

        const historyPageArgs: HistoryPageArgs = {
          entries: await getHistory(workspaceRoot),
        };

        this.navigateTo("/history", historyPageArgs);

        break;
      }
    }
  }
}
