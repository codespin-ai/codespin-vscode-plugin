import * as vscode from "vscode";
import { GeneratePanel } from "./GeneratePanel.js";

let panels: GeneratePanel[] = [];

export function render(args: GenerateArgs, context: vscode.ExtensionContext) {
  if (GeneratePanel.currentPanel) {
    GeneratePanel.currentPanel.panel.reveal(vscode.ViewColumn.One);
  } else {
    const panel = vscode.window.createWebviewPanel(
      "generate-panel",
      "CodeSpin Generate",
      vscode.ViewColumn.Active,
      {
        // Enable javascript in the webview
        enableScripts: true,
        // Restrict the webview to only load resources from the `out` directory
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
        retainContextWhenHidden: true,
      }
    );

    const generatePanel = new GeneratePanel(args, panel, context);
    panels.push(generatePanel);

    panel.onDidDispose(
      () => {
        panels = panels.filter((p) => p !== generatePanel);
      },
      null,
      generatePanel.disposables
    );
  }
}
