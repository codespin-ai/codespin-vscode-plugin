import { formatPrompt } from "codespin/dist/commands/formatPrompt/index.js";
import * as vscode from "vscode";
import { getPrintPromptArgs } from "./getPrintPromptArgs.js";
import { CopyToClipboardEvent } from "./types.js";

export async function copyToClipboard(
  clipboardArgs: CopyToClipboardEvent,
  workspaceRoot: string
) {
  const args = await getPrintPromptArgs(clipboardArgs, workspaceRoot);

  const result = await formatPrompt(args, {
    workingDir: workspaceRoot,
  });

  vscode.env.clipboard.writeText(result.prompt);
}
