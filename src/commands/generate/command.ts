import * as vscode from "vscode";
import * as path from "path";
import { render } from "./panel/render.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);

    // Map each URI to a path relative to the workspace root.
    const relativePaths = uris
      .map((uri) => {
        const fullPath = uri.fsPath;
        return path.relative(workspaceRoot, fullPath);
      })
      .sort();

    render(
      {
        files: relativePaths,
        rules: ["Typescript", "Python"],
        models: ["GPT4", "Claude 3", "Claude 4"],
      },
      context
    );
  };
}
