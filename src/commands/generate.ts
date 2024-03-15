import * as vscode from "vscode";
import * as path from "path";
import { GeneratePanel } from "../panels/GeneratePanel/index.js";

export function getGenerate(context: vscode.ExtensionContext) {
  return async function generatePrompt(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
    GeneratePanel.render(context);
    // try {
    //   // Create and show a new webview
    //   const panel = vscode.window.createWebviewPanel(
    //     "quickPrompt", // Identifies the type of the webview. Used internally
    //     "Quick Prompt", // Title of the panel displayed to the user
    //     vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    //     {} // Webview options. We don't need any for this example.
    //   );
    //   // Generate the file paths string
    //   const filePaths = uris.map((uri) => path.normalize(uri.fsPath)).join(", ");
    //   // HTML content for the webview
    //   panel.webview.html = getWebviewContent(filePaths);
    //   // Handle messages from the webview
    //   panel.webview.onDidReceiveMessage(
    //     (message) => {
    //       switch (message.command) {
    //         case "ok":
    //           vscode.window.showInformationMessage(`Files: ${filePaths}`);
    //           return;
    //       }
    //     },
    //     undefined,
    //     []
    //   );
    // } catch (error) {
    //   vscode.window.showErrorMessage((error as any).message);
    //   vscode.window.showErrorMessage("Failed to process files.");
    // }
  };
}
