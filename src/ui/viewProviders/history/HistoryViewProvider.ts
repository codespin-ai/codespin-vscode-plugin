import * as vscode from "vscode";
import { ViewProvider } from "../ViewProvider.js";
import { EventTemplate } from "../../EventTemplate.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { isInitialized } from "../../../settings/isInitialized.js";
import { HistoryPageArgs } from "../../html/pages/history/HistoryPageArgs.js";
import { getHistory } from "../../../settings/history/getHistory.js";
import { initialize } from "../../../settings/initialize.js";


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
            entries: initialized ? await getHistory(workspaceRoot) : [],
          };

          this.navigateTo("/history", historyPageArgs);
        } else {
          this.navigateTo("/initialize");
        }
        break;
      case "initialize":
        await initialize(false, workspaceRoot);

        const historyPageArgs: HistoryPageArgs = {
          entries: await getHistory(workspaceRoot),
        };

        this.navigateTo("/history", historyPageArgs);

        break;
    }
  }
}
