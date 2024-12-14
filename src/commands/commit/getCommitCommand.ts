import * as vscode from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { hasUncommittedChanges } from "codespin/dist/git/hasUncommittedChanges.js";

export function getCommitCommand(context: vscode.ExtensionContext) {
  return async function commitCommand(_: unknown): Promise<void> {
    try {
      const workspaceRoot = await getWorkspaceRoot(context);

      // We'll check changes in the root directory
      const hasChanges = await hasUncommittedChanges(workspaceRoot);

      if (!hasChanges) {
        vscode.window.showInformationMessage("No uncommitted changes found.");
        return;
      }

      vscode.window.showInformationMessage(
        "Found uncommitted changes. UI coming soon!"
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to check git status: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };
}
