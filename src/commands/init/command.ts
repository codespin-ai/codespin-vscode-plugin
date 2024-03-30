import * as vscode from "vscode";
import { initialize } from "../../codespin/initialize.js";
import { isInitialized } from "../../codespin/isInitialized.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";

export function getInitCommand(context: vscode.ExtensionContext) {
  return async function initCommand(_: unknown): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);

    if (await isInitialized(workspaceRoot)) {
      const userChoice = await vscode.window.showWarningMessage(
        "The directory has already been initialized with codespin. Do you want to force initialize?",
        "Yes",
        "No"
      );

      if (userChoice === "Yes") {
        await initialize(true, workspaceRoot);
      }
    } else {
      await initialize(false, workspaceRoot);
    }
  };
}
