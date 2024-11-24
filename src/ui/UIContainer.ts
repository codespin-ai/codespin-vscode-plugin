import { EventTemplate } from "./EventTemplate.js";
import * as vscode from "vscode";

export type WebviewOptions = {
  style?: string;
};

export type UIContainer = {
  context: vscode.ExtensionContext;
  waitUntilWebviewIsReady: () => void;
  onMessage: (message: EventTemplate) => void;
  getWebview(): vscode.Webview | undefined;
};
