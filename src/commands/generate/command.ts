import * as vscode from "vscode";
import * as path from "path";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { getModels } from "../../models/getModels.js";
import { getDefaultModel } from "../../models/getDefaultModel.js";
import { GeneratePanel } from "./panel/GeneratePanel.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);

    // Map each URI to a path relative to the workspace root.
    const relativePaths = uris
      .map((uri) => {
        const fullPath = uri.fsPath;
        return path.relative(workspaceRoot, fullPath);
      })
      .sort();

    const webviewPanel = vscode.window.createWebviewPanel(
      "generate-panel",
      "CodeSpin Generate",
      vscode.ViewColumn.Active,
      {
        // Enable javascript in the webview
        enableScripts: true,
        // Restrict the webview to only load resources from the `out` directory
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
        retainContextWhenHidden: true,
      }
    );

    const generatePanel = new GeneratePanel(
      {
        files: relativePaths.map((x) => ({ path: x, size: 100434 })),
        rules: ["Typescript", "Python"],
        models: getModels(),
        selectedModel: getDefaultModel(),
      },
      webviewPanel,
      context
    );
  };
}
