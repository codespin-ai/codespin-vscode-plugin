import * as vscode from "vscode";
import { GeneratePanel } from "../../ui/panels/generate/GeneratePanel.js";
import { EventEmitter } from "events";
import { validateConfig } from "../../config/validateConfig.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";

export function getGenerateCommand(
  context: vscode.ExtensionContext,
  globalEventEmitter: EventEmitter
) {
  return async function generateCommand(
    _: unknown,
    args: vscode.Uri[]
  ): Promise<void> {
    const workspaceRoot = await getWorkspaceRoot(context);

    if (!(await validateConfig(workspaceRoot))) {
      return;
    }

    const filePaths: string[] = !args
      ? !vscode.window.activeTextEditor
        ? []
        : [vscode.window.activeTextEditor.document.fileName]
      : args.map((x) => x.fsPath);

    const prompt =
      vscode.window.activeTextEditor && vscode.window.activeTextEditor.selection
        ? removeIndent(
            vscode.window.activeTextEditor.document.getText(
              vscode.window.activeTextEditor.selection
            )
          )
        : undefined;

    const panel = new GeneratePanel(context, globalEventEmitter);
    await panel.init({ type: "files", prompt, args: filePaths });
  };
}

function removeIndent(text: string): string {
  // Split the text into lines
  const lines = text.split("\n");

  // Determine the minimum indentation by checking leading spaces of each line
  let minIndent = Number.MAX_SAFE_INTEGER;
  lines.forEach((line) => {
    const leadingSpaces = line.match(/^ */)?.[0].length || 0;
    if (leadingSpaces < minIndent && line.trim().length > 0) {
      minIndent = leadingSpaces;
    }
  });

  // Remove the minimum indentation from each line
  const adjustedLines = lines.map((line) => {
    return line.startsWith(" ") ? line.substring(minIndent) : line;
  });

  // Rejoin the lines into a single string
  return adjustedLines.join("\n");
}
