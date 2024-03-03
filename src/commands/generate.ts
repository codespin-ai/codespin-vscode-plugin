import * as vscode from "vscode";
import * as path from "path";

export function getGenerate(context: vscode.ExtensionContext) {
  return async function generate(uri: vscode.Uri): Promise<void> {
    try {
      const filePath = path.normalize(uri.fsPath);
      vscode.window.showInformationMessage(`Hello ${filePath}`);
    } catch (error) {
      vscode.window.showErrorMessage("Failed to retrieve file path.");
    }
  };
}
