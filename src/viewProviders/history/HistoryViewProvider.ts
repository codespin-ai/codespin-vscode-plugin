import * as vscode from "vscode";
import { ViewProvider } from "../../ui/ViewProvider.js";

export class HistoryViewProvider extends ViewProvider {
  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async init() {
    console.log("here...");
    await this.onInitialize();
    await this.onWebviewReady();
    this.navigateTo("/history");
  }

  onMessage(data: any) {}
}
