import * as vscode from "vscode";
import { getWebviewContent } from "../getWebviewContent.js";

export abstract class ViewProvider implements vscode.WebviewViewProvider {
  private webviewView?: vscode.WebviewView;
  context: vscode.ExtensionContext;
  disposables: vscode.Disposable[] = [];
  navigationPromiseResolvers: Map<string, () => void>;
  isDisposed: boolean;
  initializePromise: Promise<void>;
  resolveInitialize: () => void = () => {};
  webviewReadyPromise: Promise<void>;
  resolveWebviewReady: () => void = () => {};

  constructor(context: vscode.ExtensionContext) {
    this.navigationPromiseResolvers = new Map();
    this.isDisposed = false;

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
        style: this.getStyle(),
      }
    );

    webviewView.onDidDispose(() => this.dispose(), null, this.disposables);

    webviewView.webview.onDidReceiveMessage(
      (message) => this.onDidReceiveMessageBase(message),
      null,
      this.disposables
    );

    this.resolveInitialize();
  }

  onDidReceiveMessageBase(message: any) {
    if (message.type.startsWith("command:")) {
      const command = message.type.split(":")[1];
      const args = message.args;
      vscode.commands.executeCommand(command, ...args);
    } else {
      switch (message.type) {
        case "webviewReady":
          this.resolveWebviewReady();
          break;
        case "navigated":
          const resolver = this.navigationPromiseResolvers.get(message.url);
          if (resolver) {
            resolver();
            this.navigationPromiseResolvers.delete(message.url);
          }
          break;
      }
    }

    this.onMessage(message);
  }

  getStyle() {
    return undefined;
  }

  onInitialize() {
    return this.initializePromise;
  }

  onWebviewReady() {
    return this.webviewReadyPromise;
  }

  postMessageToWebview(message: any) {
    if (!this.isDisposed) {
      this.webviewView?.webview.postMessage(message);
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

  dispose() {
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
  onMessage(message: any): void {}
  onDispose(): void {}
}