import { formatPrompt } from "codespin/dist/commands/formatPrompt/index.js";
import { CopyToClipboardEvent } from "../types.js";
import { getPrintPromptArgs } from "../getPrintPromptArgs.js";
import * as vscode from "vscode";

export async function handleCopyToClipboard(
  message: CopyToClipboardEvent,
  workspaceRoot: string
): Promise<void> {
  const args = await getPrintPromptArgs(message, workspaceRoot);

  const result = await formatPrompt(args, {
    workingDir: workspaceRoot,
  });

  await vscode.env.clipboard.writeText(result.prompt);
}
