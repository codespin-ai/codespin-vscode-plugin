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
        files: relativePaths.map((x) => ({ path: x, size: 100434 })),
        rules: ["Typescript", "Python"],
        models: [
          { name: "GPT-3.5", value: "gpt-3.5-turbo" },
          { name: "GPT-4", value: "gpt-4" },
          { name: "GPT-4 Turbo", value: "gpt-4-turbo" },
          { name: "Claude-3 Haiku", value: "claude-3-haiku" },
          { name: "Claude-3 Sonnet", value: "claude-3-sonnet" },
          { name: "Claude-3 Opus", value: "claude-3-opus" },
        ],
      },
      context
    );
  };
}
