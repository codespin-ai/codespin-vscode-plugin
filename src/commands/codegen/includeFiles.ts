import * as vscode from "vscode";
import { getActivePanel } from "../../ui/panels/generate/GeneratePanel.js";

export function getIncludeFilesCommand(context: vscode.ExtensionContext) {
  return async function includeFilesCommand(
    files: vscode.Uri[]
  ): Promise<void> {
    // Get the active GeneratePanel
    const panel = getActivePanel();
    if (!panel) {
      vscode.window.showErrorMessage("No active code generation panel found.");
      return;
    }

    // Convert the URI array to a string array of file paths
    const filePaths = (Array.isArray(files) ? files : [files]).map(
      (file) => file.fsPath
    );

    // Invoke includeFiles on the panel
    panel.includeFiles(filePaths);
  };
}
