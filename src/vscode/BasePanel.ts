import * as vscode from "vscode";
import { getWebviewContent } from "../ui/getWebView.js";

export type BasePanelArgs = { panelName: string; panelTitle: string };

export abstract class BasePanel<TArgs extends BasePanelArgs> {
  disposables: vscode.Disposable[] = [];
  args: TArgs;
  panel: vscode.WebviewPanel;

  constructor(args: TArgs, context: vscode.ExtensionContext) {
    this.args = args;

    this.panel = vscode.window.createWebviewPanel(
      args.panelName,
      args.panelTitle,
      vscode.ViewColumn.Active,
      {
        // Enable javascript in the webview
        enableScripts: true,
        // Restrict the webview to only load resources from the `out` directory
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
        retainContextWhenHidden: true,
      }
    );

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
