import { FormatPromptArgs } from "codespin/dist/commands/formatPrompt/index.js";
import { CopyToClipboardUserInput } from "./types.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";

export async function getPrintPromptArgs(
  argsFromPanel: CopyToClipboardUserInput,
  workspaceRoot: string
): Promise<FormatPromptArgs> {
  const templateArgs: FormatPromptArgs = {
    include: argsFromPanel.includedFiles.map((inc) => inc.path),
    prompt: argsFromPanel.prompt,
    spec: argsFromPanel.codingConvention
      ? getCodingConventionPath(argsFromPanel.codingConvention, workspaceRoot)
      : undefined,
    template: "files",
  };

  return templateArgs;
}
