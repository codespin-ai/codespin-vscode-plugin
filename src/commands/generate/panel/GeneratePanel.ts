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
          <title>CodeSpin Generate</title>
        </head>
        <body>
          <h1 style="font-size: smaller">CodeSpin Generate</h1>
          <div class="model-selection-container" style="margin-top: 1em">
            <label for="model-selection-dropdown">Model:</label><br />
            <vscode-dropdown style="width:180px; margin-top: 4px;" id="model-selection-dropdown">
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
            <vscode-text-area cols="50" rows="10" resize="both" autofocus id="prompt-text-area" style="margin-top: 4px;"></vscode-text-area>
          </div>          
          <div style="margin-top: 1em">
            <vscode-button>Execute</vscode-button>
          </div>
          <div class="file-version-container" style="margin-top: 1em">
            <label for="file-version-dropdown">File Version:</label><br />
            <vscode-dropdown style="width:180px; margin-top: 4px;" id="file-version-dropdown">
              <vscode-option value="Current">Working Copy</vscode-option>
              <vscode-option value="GPT-4">HEAD</vscode-option>            
            </vscode-dropdown>
          </div>
          <div id="included-files-container" style="margin-top: 2em">
            <label>Included Files:</label><br />
            <div id="included-files" style="display: flex; flex-direction: column;">
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
