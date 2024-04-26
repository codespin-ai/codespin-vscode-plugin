import { EventEmitter } from "events";
import * as vscode from "vscode";
import { EventTemplate } from "../EventTemplate.js";
import { WebviewOptions } from "../UIContainer.js";
import { getMessageHandler } from "../getMessageHandler.js";
import { getWebviewContent } from "../getWebviewContent.js";

export abstract class ViewProvider implements vscode.WebviewViewProvider {
  private webviewView?: vscode.WebviewView;
  webviewOptions: WebviewOptions;
  context: vscode.ExtensionContext;
  disposables: vscode.Disposable[] = [];
  navigationPromiseResolvers: Map<string, () => void>;
  isDisposed: boolean;
  initializePromise: Promise<void>;
  resolveInitialize: () => void = () => {};
  webviewReadyPromise: Promise<void>;
  resolveWebviewReady: () => void = () => {};
  globalEventEmitter: EventEmitter;
  messageHandler: ReturnType<typeof getMessageHandler>;

  constructor(
    webviewOptions: WebviewOptions,
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    this.webviewOptions = webviewOptions;
    this.navigationPromiseResolvers = new Map();
    this.isDisposed = false;
    this.globalEventEmitter = globalEventEmitter;
    this.messageHandler = getMessageHandler(this);

    this.initializePromise = new Promise((resolve) => {
      this.resolveInitialize = resolve;
    });
    this.context = context;

    this.initializePromise = new Promise((resolve) => {
      this.resolveWebviewReady = resolve;
    });

    this.webviewReadyPromise = new Promise((resolve) => {
      this.resolveInitialize = resolve;
    });

    this.globalEventEmitter.on("message", this.messageHandler);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = getWebviewContent(
      webviewView.webview,
      this.context.extensionUri,
      {
        style: this.webviewOptions.style,
      }
    );

    webviewView.onDidDispose(() => this.dispose(), null, this.disposables);

    webviewView.webview.onDidReceiveMessage(
      this.messageHandler,
      null,
      this.disposables
    );

    this.resolveInitialize();
  }

  initializeEvent() {
    return this.initializePromise;
  }

  getWebview(): vscode.Webview | undefined {
    return this.webviewView?.webview;
  }

  webviewReadyEvent() {
    return this.webviewReadyPromise;
  }

  dispose() {
    this.globalEventEmitter.removeListener("message", this.messageHandler);

    this.isDisposed = true;
    this.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }

    this.onDispose();
  }

  // These will be overridden
  onMessage(message: EventTemplate): void {}
  onDispose(): void {}
}
