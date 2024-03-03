import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";

export class QuickPromptPanel {
  public static currentPanel: QuickPromptPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      context.extensionUri
    );
  }

  public static render(context: vscode.ExtensionContext) {
    if (QuickPromptPanel.currentPanel) {
      QuickPromptPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "hello-world",
        "Hello World",
        vscode.ViewColumn.One,
        {
          // Enable javascript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` directory
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "out"),
          ],
        }
      );

      QuickPromptPanel.currentPanel = new QuickPromptPanel(panel, context);
    }
  }

  public dispose() {
    QuickPromptPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  // ... other code ...

  private _getWebviewContent(
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
          <title>Hello World!34</title>
        </head>
        <body>
          <h1>Hello World33!!</h1>
          <vscode-button id="howdy">Howdy!!!</vscode-button>
          <vscode-checkbox id="howdy">Howdy!e4</vscode-button>
          <script type="module" src="${webviewUri}"></script>
        </body>
      </html>
    `;
  }
}
