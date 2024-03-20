import * as vscode from "vscode";
import { getUri } from "../vscode/getUri.js";

export function getWebviewContent(
  url: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri
) {
  const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeSpin</title>
        <style>
          body { font-family: var(--font-family); }            
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          (async () => {
            const module = await import('${webviewUri}');
            module.generateWebViewInit("${url}");
          })();
        </script>
      </body>
    </html>
  `;
}
