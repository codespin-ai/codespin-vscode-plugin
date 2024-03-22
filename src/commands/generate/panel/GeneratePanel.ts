import * as vscode from "vscode";
import { BasePanel } from "../../../vscode/BasePanel.js";

export class GeneratePanel extends BasePanel<GenerateArgs> {
  constructor(
    args: GenerateArgs,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    super(args, panel, context);
  }

  override getDefaultUrl(): string {
    return "/generate";
  }

  override handleMessageFromWebview(message: any) {
    console.log({ message });
    if (message.command === "webviewReady") {
      this.panel.webview.postMessage({
        command: "load",
        files: this.args.files,
        models: this.args.models,
        rules: this.args.rules,
        selectedModel: this.args.selectedModel,
      });
    } else if (message.command === "generate") {
      
    }
  }
}
