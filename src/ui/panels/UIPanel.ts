import { randomInt } from "crypto";
import { EventEmitter } from "events";
import * as vscode from "vscode";
import { MessageTemplate } from "../MessageTemplate.js";
import { WebviewOptions } from "../UIContainer.js";
import { getMessageHandler } from "../getMessageHandler.js";
import { getWebviewContent } from "../getWebviewContent.js";

export abstract class UIPanel {
  context: vscode.ExtensionContext;
  disposables: vscode.Disposable[] = [];
  panel: vscode.WebviewPanel;
  webviewReadyPromise: Promise<void>;
  webviewReadyPromiseResolve: () => void = () => {};
  isDisposed: boolean;
  globalEventEmitter: EventEmitter;
  webviewOptions: WebviewOptions;
  messageHandler: ReturnType<typeof getMessageHandler>;
  navigationPromiseResolvers: Map<string, () => void>;

  constructor(
    webviewOptions: WebviewOptions,
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    this.navigationPromiseResolvers = new Map();
    webviewOptions = webviewOptions ?? {};
    webviewOptions.style =
      webviewOptions.style ?? `code { background: initial; }`;

    this.webviewOptions = webviewOptions;
    this.context = context;
    this.globalEventEmitter = globalEventEmitter;
    this.isDisposed = false;
    this.messageHandler = getMessageHandler(this);

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

    (this.panel as any).id = randomInt(100000);

    this.panel.webview.html = getWebviewContent(
      this.panel.webview,
      this.context.extensionUri,
      this.webviewOptions
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      this.messageHandler,
      null,
      this.disposables
    );

    // Added to log when the panel is opened or brought to the front
    this.panel.onDidChangeViewState(
      (e) => this.onDidChangeViewState(e),
      null,
      this.disposables
    );

    this.panel.onDidDispose(() => {}, null, this.disposables);

    this.webviewReadyPromise = new Promise((resolve) => {
      this.webviewReadyPromiseResolve = resolve;
    });

    this.globalEventEmitter.on("message", this.messageHandler);
  }

  webviewReadyEvent() {
    return this.webviewReadyPromise;
  }

  getWebview(): vscode.Webview {
    return this.panel.webview;
  }

  dispose() {
    this.globalEventEmitter.removeListener("message", this.messageHandler);

    this.isDisposed = true;
    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }

    this.onDispose();
  }

  // These will be overridden
  onMessage(message: MessageTemplate): void {}
  onDispose(): void {}
  onDidChangeViewState(e: vscode.WebviewPanelOnDidChangeViewStateEvent): void {}
}
