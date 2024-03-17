import * as vscode from "vscode";

export function getWorkspaceRoot(context: vscode.ExtensionContext): string {
  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    // Assuming you're working with files from the first workspace folder.
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
  } else {
    vscode.window.showErrorMessage("No workspace is opened.");
    throw new Error("No workspace is opened.");
  }
}
