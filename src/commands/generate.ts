import * as vscode from "vscode";
import * as path from "path";
import { getWorkspaceRoot } from "../vscode/getWorkspaceRoot.js";
import { getModels } from "../models/getModels.js";
import { getDefaultModel } from "../models/getDefaultModel.js";
import { UIPanel } from "../vscode/UIPanel.js";

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

    const uiPanel = new UIPanel(context);

    await uiPanel.onReady();

    await uiPanel.navigateTo("/generate");

    uiPanel.postMessageToWebview({
      type: "onGenerate",
      files: relativePaths.map((x) => ({ path: x, size: 100434 })),
      rules: ["Typescript", "Python"],
      models: getModels(),
      selectedModel: getDefaultModel(),
    });
  };
}
