import * as vscode from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { getActivePanel } from "../../ui/chat/GeneratePanel.js";
import { includeFiles } from "../../ui/chat/includeFiles.js";

export function getIncludeFilesCommand(context: vscode.ExtensionContext) {
  return async function includeFilesCommand(
    _: unknown,
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

    const workspaceRoot = await getWorkspaceRoot(context);

    // Invoke includeFiles on the panel
    includeFiles(panel, filePaths, workspaceRoot);
  };
}
