import * as vscode from "vscode";
import { getWebviewContent } from "./getWebviewContent.js";
import { MessageHandler } from "./MessageHandler.js";

export class UIPanel {
  context: vscode.ExtensionContext;
  disposables: vscode.Disposable[] = [];
  panel: vscode.WebviewPanel;
  webviewReadyPromise: Promise<void>;
  resolveWebviewReady: () => void = () => {};
  navigationPromiseResolvers: Map<string, () => void>;
  onMessage: MessageHandler;
  isDisposed: boolean;

  constructor(context: vscode.ExtensionContext, onMessage: MessageHandler) {
    this.navigationPromiseResolvers = new Map();
    this.context = context;
    this.onMessage = onMessage;
    this.isDisposed = false;
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
      this.context.extensionUri,
      {
        style: this.getStyle(),
      }
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessageFromWebview(message),
      null,
      this.disposables
    );

    this.panel.onDidDispose(() => {}, null, this.disposables);

    this.webviewReadyPromise = new Promise((resolve) => {
      this.resolveWebviewReady = resolve;
    });
  }

  getStyle() {
    return `code { background: initial; }`;
  }

  onWebviewReady() {
    return this.webviewReadyPromise;
  }

  handleMessageFromWebview(message: any) {
    if (message.type.startsWith("command:")) {
      const command = message.type.split(":")[1];
      const args = message.args;
      vscode.commands.executeCommand(command, ...args);
    } else {
      switch (message.type) {
        case "webviewReady":
          this.resolveWebviewReady();
        case "navigated":
          const resolver = this.navigationPromiseResolvers.get(message.url);
          if (resolver) {
            resolver();
            this.navigationPromiseResolvers.delete(message.url);
          }
      }
    }
    this.onMessage(message);
  }

  postMessageToWebview(message: any) {
    if (!this.isDisposed) {
      this.panel.webview.postMessage(message);
    }
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
    this.isDisposed = true;
    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
