import * as vscode from "vscode";
import { getUri } from "../../../utilities/getUri";

export class GeneratePanel {
  public static currentPanel: GeneratePanel | undefined;
  readonly panel: vscode.WebviewPanel;
  disposables: vscode.Disposable[] = [];
  args: GenerateArgs;

  constructor(
    args: GenerateArgs,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this.args = args;
    this.panel = panel;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessageFromWebview(message),
      null,
      this.disposables
    );

    this.panel.webview.html = this.getWebviewContent(
      this.panel.webview,
      context.extensionUri
    );
  }

  private handleMessageFromWebview(message: any) {
    console.log({ message });
    if (message.command === "webviewReady") {
      this.panel.webview.postMessage({
        command: "load",
        files: this.args.files,
      });
    } else if (message.command === "execute") {
      console.log({ message });
    }
  }

  public dispose() {
    GeneratePanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
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
                module.generateWebViewInit();
            })();
        </script>
        </body>
      </html>
    `;
  }
}
