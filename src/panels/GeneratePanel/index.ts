import * as vscode from "vscode";
import { getUri } from "../../utilities/getUri";

type GenerateArgs = {
  files: string[];
};

export class GeneratePanel {
  public static currentPanel: GeneratePanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private _isWebviewReady = false;
  private _messageQueue: any[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (message) => this._handleMessageFromWebview(message),
      null,
      this._disposables
    );

    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      context.extensionUri
    );
  }

  public postMessageToWebview(message: any) {
    if (this._isWebviewReady) {
      this._panel.webview.postMessage(message);
    } else {
      // Queue the message if the webview is not ready
      this._messageQueue.push(message);
    }
  }

  private _handleMessageFromWebview(message: any) {
    // Handle messages from the webview. For example, a readiness notification
    if (message.command === "webviewReady") {
      this._isWebviewReady = true;
      // Send all queued messages
      this._messageQueue.forEach((msg) => this._panel.webview.postMessage(msg));
      this._messageQueue = [];
    }
  }

  public static render(args: GenerateArgs, context: vscode.ExtensionContext) {
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

      GeneratePanel.currentPanel.postMessageToWebview({
        command: "loadFiles",
        files: args.files,
      });
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
            <vscode-dropdown style="width:180px" id="model-selection-dropdown">
              <vscode-option value="GPT-3.5">GPT 3.5</vscode-option>
              <vscode-option value="GPT-4">GPT 4</vscode-option>
              <vscode-option value="GPT-4-32k">GPT 4 32k</vscode-option>
              <vscode-option value="GPT-4-Turbo">GPT 4 Turbo</vscode-option>              
              <vscode-option value="Claude-3 Haiku">Claude 3 Haiku</vscode-option>              
              <vscode-option value="Claude-3-Sonnet">Claude 3 Sonnet</vscode-option>              
              <vscode-option value="Claude-3-Opus">Claude 3 Opus</vscode-option>              
            </vscode-dropdown>
          </div>
          <div class="prompt-container" style="margin-top: 1em">
            <label for="prompt-text-area">Prompt:</label><br />
            <vscode-text-area cols="50" rows="10" resize="both" autofocus id="prompt-text-area"></vscode-text-area>
          </div>
          <div style="margin-top: 1em">
            <vscode-button>Execute</vscode-button>
          </div>
          <div id="include-files-container" style="margin-top: 1em">
            <label>Selected files:</label><br />
            <ul id="include-files" style="list-style-type: none; padding: 0;">
              <!-- File checkboxes will be inserted here by JavaScript -->
            </div>            
          </div>
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
