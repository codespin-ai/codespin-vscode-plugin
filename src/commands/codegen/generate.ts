import * as vscode from "vscode";
import { GeneratePanel } from "../../ui/panels/generate/GeneratePanel.js";
import { GenerationUserInput } from "../../ui/panels/generate/types.js";

export type GenerateCommandEvent = {
  type: "command:codespin-ai.generate";
  args: [undefined, GenerationUserInput];
};

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    args: vscode.Uri[] | GenerationUserInput
  ): Promise<void> {
    const filePaths: string[] | GenerationUserInput = !args
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
