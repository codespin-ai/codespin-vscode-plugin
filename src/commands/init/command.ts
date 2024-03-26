import { init } from "codespin/dist/commands/init.js";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";

export function getInitCommand(context: vscode.ExtensionContext) {
  return async function initCommand(_: unknown): Promise<void> {
    // Check if there is at least one workspace folder opened.
    const workspaceRoot = getWorkspaceRoot(context);

    const codespinConfigPath = path.join(workspaceRoot, ".codespin");

    // Check if codespin.json exists
    if (fs.existsSync(codespinConfigPath)) {
      // Ask the user if they want to force initialize
      const userChoice = await vscode.window.showWarningMessage(
        "The directory has already been initialized with codespin. Do you want to force initialize?",
        "Yes",
        "No"
      );

      if (userChoice === "Yes") {
        await init({
          force: true,
        });
      }
      // If the user chooses "No", do nothing.
    } else {
      // If codespin.json doesn't exist, call init({}) without an alert.
      await init({});
    }
  };
}
