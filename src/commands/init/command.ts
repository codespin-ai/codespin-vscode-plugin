import { init } from "codespin/dist/commands/init.js";
import * as fs from "fs";
import { mkdirSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";

export function getInitCommand(context: vscode.ExtensionContext) {
  return async function initCommand(_: unknown): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);

    const codespinConfigPath = path.join(workspaceRoot, ".codespin");
    const conventionsPath = path.join(codespinConfigPath, "conventions");
    const historyPath = path.join(codespinConfigPath, "history");

    if (fs.existsSync(codespinConfigPath)) {
      const userChoice = await vscode.window.showWarningMessage(
        "The directory has already been initialized with codespin. Do you want to force initialize?",
        "Yes",
        "No"
      );

      if (userChoice === "Yes") {
        await init(
          {
            force: true,
          },
          { workingDir: workspaceRoot }
        );
        mkdirSync(conventionsPath, { recursive: true });
        mkdirSync(historyPath, { recursive: true });
      }
    } else {
      await init({}, { workingDir: workspaceRoot });
      mkdirSync(conventionsPath, { recursive: true });
      mkdirSync(historyPath, { recursive: true });
    }
  };
}
