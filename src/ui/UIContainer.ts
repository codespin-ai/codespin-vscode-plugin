import * as vscode from "vscode";
import { MessageTemplate } from "./types.js";

export type WebviewOptions = {
  style?: string;
};

export type UIContainer = {
  context: vscode.ExtensionContext;
  webviewReadyEvent: () => Promise<void>;
  webviewReadyPromiseResolve: () => void;
  navigationPromiseResolvers: Map<string, () => void>;
  onMessage: (message: MessageTemplate) => void;
  getWebview(): vscode.Webview | undefined;
};
