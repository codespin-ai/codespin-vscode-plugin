import * as vscode from "vscode";
import * as path from "path";
import { render } from "./panel/render.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
    // Check if there is at least one workspace folder opened.
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      // Assuming you're working with files from the first workspace folder.
      const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

      // Map each URI to a path relative to the workspace root.
      const relativePaths = uris
        .map((uri) => {
          const fullPath = uri.fsPath;
          return path.relative(workspaceRoot, fullPath);
        })
        .sort();

      render({ files: relativePaths }, context);
    } else {
      // Handle the case where no workspace is opened.
      vscode.window.showErrorMessage("No workspace is opened.");
    }
  };
}
