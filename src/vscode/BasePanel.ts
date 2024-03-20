import * as vscode from "vscode";
import { getWebviewContent } from "../ui/getWebView.js";

export abstract class BasePanel<TArgs> {
  readonly panel: vscode.WebviewPanel;
  disposables: vscode.Disposable[] = [];
  args: TArgs;

  constructor(
    args: TArgs,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this.args = args;
    this.panel = panel;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessageFromWebview(message),
      null,
      this.disposables
    );

    this.panel.webview.html = getWebviewContent(
      this.getDefaultUrl(),
      this.panel.webview,
      context.extensionUri
    );

    this.panel.onDidDispose(() => {}, null, this.disposables);
  }

  abstract handleMessageFromWebview(message: any): void;

  abstract getDefaultUrl(): string;

  public dispose() {
    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
