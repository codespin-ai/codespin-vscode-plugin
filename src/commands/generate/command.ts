import * as vscode from "vscode";
import { RegeneratePageArgs } from "../../ui/html/pages/history/RegeneratePageArgs.js";
import { GeneratePanel } from "../../ui/panels/generate/GeneratePanel.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    args: vscode.Uri[] | RegeneratePageArgs
  ): Promise<void> {
    if (!args) {
      return;
    }

    const panel = new GeneratePanel(context);
    await panel.init(args);
  };
}
