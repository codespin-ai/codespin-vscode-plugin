import * as vscode from "vscode";
import { EventTemplate } from "../../EventTemplate.js";
import { initialize } from "../../settings/initialize.js";
import { isInitialized } from "../../settings/isInitialized.js";
import { ViewProvider } from "../../ui/ViewProvider.js";
import { HistoryPageArgs } from "../../ui/pages/history/HistoryPageArgs.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { getHistory } from "../../settings/history/getHistory.js";

export class HistoryViewProvider extends ViewProvider {
  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async init() {
    await this.onInitialize();
    await this.onWebviewReady();
  }

  async onMessage(data: EventTemplate<unknown>) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    switch (data.type) {
      case "webviewReady":
        const initialized = await isInitialized(workspaceRoot);

        if (initialized) {
          const historyPageArgs: HistoryPageArgs = {
            entries: initialized ? await getHistory(this.context) : [],
          };

          this.navigateTo("/history", historyPageArgs);
        } else {
          this.navigateTo("/initialize");
        }
        break;
      case "initialize":
        await initialize(false, workspaceRoot);

        const historyPageArgs: HistoryPageArgs = {
          entries: await getHistory(this.context),
        };

        this.navigateTo("/history", historyPageArgs);

        break;
    }
  }
}
