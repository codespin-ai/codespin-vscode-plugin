import * as codespin from "codespin";
import * as vscode from "vscode";
import { initialize } from "../settings/initialize.js";
import { isInitialized } from "../settings/isInitialized.js";

export async function validateConfig(workspaceRoot: string): Promise<boolean> {
  if (await isInitialized(workspaceRoot)) {
    try {
      await codespin.settings.readCodeSpinConfig(undefined, workspaceRoot);
      return true;
    } catch (ex: any) {
      if (ex instanceof codespin.errors.UnsupportedConfigVersionError) {
        // Ask the user if they want to force initialize
        const userChoice = await vscode.window.showWarningMessage(
          "CodeSpin configuration (.codespin/codespin.json) is outdated. Reset?",
          "Yes",
          "No"
        );
        if (userChoice === "Yes") {
          await initialize(true, workspaceRoot);
          return true;
        } else {
          return false;
        }
      }

      // Ask the user if they want to force initialize
      const userChoice = await vscode.window.showWarningMessage(
        "CodeSpin configuration (.codespin/codespin.json) is invalid. Reset?",
        "Yes",
        "No"
      );
      if (userChoice === "Yes") {
        await initialize(true, workspaceRoot);
        return true;
      } else {
        return false;
      }
    }
  } else {
    const userChoice = await vscode.window.showWarningMessage(
      "CodeSpin configuration (.codespin/codespin.json) does not exist. Create?",
      "Yes",
      "No"
    );
    if (userChoice === "Yes") {
      await initialize(false, workspaceRoot);
      return true;
    } else {
      return false;
    }
  }
}
