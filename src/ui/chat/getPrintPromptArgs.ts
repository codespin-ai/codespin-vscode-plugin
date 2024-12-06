import { FormatPromptArgs } from "codespin/dist/commands/formatPrompt/index.js";
import { getCodingConventionPath } from "../../settings/conventions/getCodingConventionPath.js";
import { CopyToClipboardUserInput } from "./copyToClipboard.js";

export async function getPrintPromptArgs(
  userInput: CopyToClipboardUserInput,
  workspaceRoot: string
): Promise<FormatPromptArgs> {
  const templateArgs: FormatPromptArgs = {
    include: userInput.includedFiles.map((inc) => inc.path),
    prompt: userInput.prompt,
    spec: userInput.codingConvention
      ? getCodingConventionPath(userInput.codingConvention, workspaceRoot)
      : undefined,
    template: "files",
  };

  return templateArgs;
}
