import * as codespin from "codespin";
import * as vscode from "vscode";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { CopyToClipboardEvent } from "../types.js";

export async function handleCopyToClipboard(
  userInput: CopyToClipboardEvent,
  workspaceRoot: string
): Promise<void> {
  const templateArgs: codespin.commands.FormatPromptArgs = {
    include: userInput.includedFiles.map((inc) => inc.path),
    prompt: userInput.prompt,
    spec: userInput.codingConvention
      ? getCodingConventionPath(userInput.codingConvention, workspaceRoot)
      : undefined,
    template: "files",
  };

  const result = await codespin.commands.formatPrompt(templateArgs, {
    workingDir: workspaceRoot,
  });

  await vscode.env.clipboard.writeText(result.prompt);
}
