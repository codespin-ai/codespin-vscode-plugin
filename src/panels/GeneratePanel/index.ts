import * as vscode from "vscode";
import { getUri } from "../../utilities/getUri";

export class GeneratePanel {
  public static currentPanel: GeneratePanel | undefined;
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
    if (GeneratePanel.currentPanel) {
      GeneratePanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "generate-panel",
        "Generate Panel",
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

      GeneratePanel.currentPanel = new GeneratePanel(panel, context);
    }
  }

  public dispose() {
    GeneratePanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

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
          <title>Quick Prompt</title>
        </head>
        <body>
          <h1>Quick Prompt</h1>
          <div class="model-selection-container" style="margin-top: 1em">
            <label for="model-selection-dropdown">Model:</label><br />
            <vscode-dropdown id="model-selection-dropdown">
              <vscode-option value="GPT-3.5">GPT 3.5</vscode-option>
              <vscode-option value="GPT-4">GPT 4</vscode-option>
              <vscode-option value="GPT-4-32k">GPT 4 32k</vscode-option>
              <vscode-option value="GPT-4-Turbo">GPT 4 Turbo</vscode-option>              
            </vscode-dropdown>
          </div>
          <div class="prompt-container" style="margin-top: 1em">
            <label for="prompt-text-area">Prompt:</label><br />
            <vscode-text-area cols="50" rows="10" resize="both" autofocus id="prompt-text-area"></vscode-text-area>
          </div>
          <p style="style="margin-top: 1em">
            <vscode-button>Execute</vscode-button>
          </p>
          <script>
            (async () => {
                const module = await import('${webviewUri}');
                module.initGeneratePanel(); 
            })();
        </script>
        </body>
      </html>
    `;
  }
}
