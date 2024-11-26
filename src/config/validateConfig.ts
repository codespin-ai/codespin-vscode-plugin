import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { TypedError } from "codespin/dist/TypedError.js";
import * as vscode from "vscode";
import { initialize } from "../settings/initialize.js";
import { isInitialized } from "../settings/isInitialized.js";

export async function validateConfig(workspaceRoot: string): Promise<boolean> {
  if (await isInitialized(workspaceRoot)) {
    try {
      await readCodeSpinConfig(undefined, workspaceRoot);
      return true;
    } catch (ex: any) {
      if (
        ex instanceof TypedError &&
        ex.type === "UNSUPPORTED_CONFIG_VERSION"
      ) {
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
