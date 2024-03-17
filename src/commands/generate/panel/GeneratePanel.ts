import * as vscode from "vscode";
import { getUri } from "../../../vscode/getUri";

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
      context.extensionUri,
      this.args
    );
  }

  private handleMessageFromWebview(message: any) {
    console.log({ message });
    if (message.command === "webviewReady") {
      this.panel.webview.postMessage({
        command: "load",
        files: this.args.files,
        models: this.args.models, // Assuming 'models' is part of GenerateArgs
        rules: this.args.rules, // Assuming 'rules' is part of GenerateArgs
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

  private getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    args: GenerateArgs
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
              module.generateWebViewInit();
            })();
          </script>
        </body>
      </html>
    `;
  }
}

/*
          <h1>Generate</h1>
          <div class="model-selection-container" style="margin-top: 1em">
            <label for="model-selection-dropdown">Model:</label><br />
            <vscode-dropdown style="width:180px; margin-top: 4px;" id="model-selection-dropdown"></vscode-dropdown>
          </div>
          <div class="prompt-container" style="margin-top: 1em">
            <label for="prompt-text-area">Prompt:</label><br />
            <vscode-text-area cols="50" rows="10" resize="both" autofocus id="prompt-text-area" style="margin-top: 4px; font-family: var(--vscode-editor-font-family);"></vscode-text-area>
          </div>
          <div style="margin-top: 1em; margin-bottom: 1em;">
            <vscode-button>Generate Code</vscode-button>
          </div>
          <vscode-divider role="presentation"></vscode-divider>
          <h3>Additional Options</h3>
          <div class="generation-target-container" style="margin-top: 1em">
            <label for="generation-target-dropdown">Files to generate:</label><br />
            <vscode-dropdown style="width:180px; margin-top: 4px;" id="generation-target-dropdown">
              <vscode-option value="prompt">As in Prompt</vscode-option>
              <!-- File options will be inserted dynamically -->
            </vscode-dropdown>
          </div>
          <div class="select-rules-container" style="margin-top: 1em">
            <label for="select-rules-dropdown">Coding Conventions:</label><br />
            <vscode-dropdown style="width:180px; margin-top: 4px;" id="select-rules-dropdown"></vscode-dropdown>
          </div>
          <div class="file-version-container" style="margin-top: 1em">
            <label for="file-version-dropdown">File Version:</label><br />
            <vscode-dropdown style="width:180px; margin-top: 4px;" id="file-version-dropdown">
              <vscode-option value="working">Working Copy</vscode-option>
              <vscode-option value="head">Git HEAD</vscode-option>            
            </vscode-dropdown>
          </div>
          <div id="included-files-container" style="margin-top: 2em">     
            <label for="file-version-dropdown">Included Files:</label><br />
            <div id="included-files" style="display: flex; flex-direction: column;">
              <!-- File checkboxes will be inserted here by JavaScript -->
            </div>            
          </div>
*/