import * as vscode from "vscode";
import * as path from "path";
import { QuickPromptPanel } from "../panels/QuickPromptPanel.js";

export function getQuickPrompt(context: vscode.ExtensionContext) {
  return async function quickPrompt(_: any, uris: vscode.Uri[]): Promise<void> {
    QuickPromptPanel.render(context);
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

function getWebviewContent(filePaths: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quick Prompt</title>
</head>
<body>
    <div>
      <h4>Enter your prompt:</h4>
      <p>
        <textarea id="filePaths" rows="10" cols="50">${filePaths}</textarea>
      </p>
      <p>
        <button style="width:100px" onclick="sendMessage()">OK</button>    
      </p>
    </div>    
    <script>
        const vscode = acquireVsCodeApi();
        function sendMessage() {
            vscode.postMessage({
                command: 'ok',
                text: document.getElementById('filePaths').value
            })
        }
    </script>
</body>
</html>`;
}
