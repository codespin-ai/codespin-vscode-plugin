import * as vscode from "vscode";
import { getWebviewContent } from "./getWebView.js";

export type MessageHandler = (message: any) => void;

export class UIPanel {
  context: vscode.ExtensionContext;
  disposables: vscode.Disposable[] = [];
  panel: vscode.WebviewPanel;
  readyPromise: Promise<void>;
  resolveReady: () => void = () => {};
  navigationPromiseResolvers: Map<string, () => void>;
  onMessage: MessageHandler;

  constructor(context: vscode.ExtensionContext, onMessage: MessageHandler) {
    this.navigationPromiseResolvers = new Map();
    this.context = context;
    this.onMessage = onMessage;

    this.panel = vscode.window.createWebviewPanel(
      "codespin-panel",
      "CodeSpin",
      vscode.ViewColumn.Active,
      {
        // Enable javascript in the webview
        enableScripts: true,
        // Restrict the webview to only load resources from the `out` directory
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
        retainContextWhenHidden: true,
      }
    );

    this.panel.webview.html = getWebviewContent(
      this.panel.webview,
      this.context.extensionUri
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessageFromWebview(message),
      null,
      this.disposables
    );

    this.panel.onDidDispose(() => {}, null, this.disposables);

    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  onReady() {
    return this.readyPromise;
  }

  handleMessageFromWebview(message: any) {
    switch (message.type) {
      case "webviewReady":
        this.resolveReady();
      case "navigated":
        const resolver = this.navigationPromiseResolvers.get(message.url);
        if (resolver) {
          resolver();
          this.navigationPromiseResolvers.delete(message.url);
        }
    }
    this.onMessage(message);
  }

  postMessageToWebview(message: any) {
    this.panel.webview.postMessage(message);
  }

  navigateTo(url: string, args?: any) {
    return new Promise<void>((resolve) => {
      this.navigationPromiseResolvers.set(url, resolve);
      this.postMessageToWebview({
        type: "navigate",
        url,
        state: args,
      });
    });
  }

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
