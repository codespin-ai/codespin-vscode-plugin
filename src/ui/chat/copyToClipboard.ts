import { formatPrompt } from "codespin/dist/commands/formatPrompt/index.js";
import * as vscode from "vscode";
import { getPrintPromptArgs } from "./getPrintPromptArgs.js";

export type CopyToClipboardUserInput = {
  prompt: string;
  codingConvention: string | undefined;
  includedFiles: {
    path: string;
  }[];
};

export type CopyToClipboardEvent = {
  type: "copyToClipboard";
} & CopyToClipboardUserInput;

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
