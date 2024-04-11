import * as vscode from "vscode";
import { GeneratePanel } from "../../ui/panels/generate/GeneratePanel.js";
import { RegenerateArgs } from "../../ui/panels/generate/types.js";

export type GenerateCommandEvent = {
  type: "command:codespin-ai.generate";
  args: [undefined, RegenerateArgs];
};

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    args: vscode.Uri[] | RegenerateArgs
  ): Promise<void> {
    const filePaths: string[] | RegenerateArgs = !args
      ? !vscode.window.activeTextEditor
        ? []
        : [vscode.window.activeTextEditor.document.fileName]
      : Array.isArray(args)
      ? args.map((x) => x.fsPath)
      : args;

    const panel = new GeneratePanel(context);
    await panel.init(filePaths);
  };
}
