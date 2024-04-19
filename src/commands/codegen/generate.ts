import * as vscode from "vscode";
import { GeneratePanel } from "../../ui/panels/generate/GeneratePanel.js";
import { EventEmitter } from "events";

export function getGenerateCommand(
  context: vscode.ExtensionContext,
  globalEventEmitter: EventEmitter
) {
  return async function generateCommand(
    _: unknown,
    args: vscode.Uri[]
  ): Promise<void> {
    const filePaths: string[] = !args
      ? !vscode.window.activeTextEditor
        ? []
        : [vscode.window.activeTextEditor.document.fileName]
      : args.map((x) => x.fsPath);

    const prompt =
      vscode.window.activeTextEditor && vscode.window.activeTextEditor.selection
        ? vscode.window.activeTextEditor.document.getText(
            vscode.window.activeTextEditor.selection
          )
        : undefined;

    const panel = new GeneratePanel(context, globalEventEmitter);
    await panel.init({ type: "files", prompt, args: filePaths });
  };
}
