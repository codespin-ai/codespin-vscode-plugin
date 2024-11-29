import * as vscode from "vscode";
import { getUri } from "../vscode/getUri.js";

type WebviewOptions = {
  style?: string;
};

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  options: WebviewOptions
) {
  const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
  const cssUri = getUri(webview, extensionUri, ["out", "styles.css"]);
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
