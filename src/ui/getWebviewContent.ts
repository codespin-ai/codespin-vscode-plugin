import * as vscode from "vscode";
import { getUri } from "../vscode/getUri.js";

type WebviewOptions = {
  style?: string;
};

export function getWebviewContent(
  jsFile: string,
  cssFile: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  options: WebviewOptions
) {
  const webviewUri = getUri(webview, extensionUri, ["out", jsFile]);
  const cssUri = getUri(webview, extensionUri, ["out", cssFile]);
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeSpin</title>
        <style>
          body { font-family: var(--font-family); }
          ${options.style || ""}
        </style>        
        <link href="${cssUri}" rel="stylesheet">
      </head>
      <body>
        <div id="root"></div>
        <script>
          (async () => {
            const module = await import('${webviewUri}');
            module.initWebview();
          })();
        </script>
      </body>
    </html>
  `;
}
