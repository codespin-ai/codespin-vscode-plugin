import * as vscode from "vscode";
import { BasePanel, BasePanelArgs } from "../../../vscode/BasePanel.js";
import { GenerateArgs } from "./GenerateArgs.js";

export class GeneratePanel extends BasePanel<GenerateArgs & BasePanelArgs> {
  constructor(
    args: GenerateArgs & BasePanelArgs,
    context: vscode.ExtensionContext
  ) {
    super(args, context);
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
