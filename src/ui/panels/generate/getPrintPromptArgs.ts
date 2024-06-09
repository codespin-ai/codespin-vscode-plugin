import { FormatPromptArgs } from "codespin/dist/commands/formatPrompt/index.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { GenerateUserInput } from "./types.js";

export async function getPrintPromptArgs(
  argsFromPanel: GenerateUserInput,
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
