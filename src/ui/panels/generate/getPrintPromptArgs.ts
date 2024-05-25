import { GenerateArgs } from "codespin/dist/commands/generate/index.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { GenerateUserInput } from "./types.js";

export function getPrintPromptArgs(
  argsFromPanel: GenerateUserInput,
  workspaceRoot: string
): GenerateArgs {
  const printPromptArgs: GenerateArgs = {
    prompt: argsFromPanel.prompt,
    printPrompt: true,
    out:
      argsFromPanel.codegenTargets !== ":prompt"
        ? argsFromPanel.codegenTargets
        : undefined,
    include: argsFromPanel.includedFiles
      .map((f) =>
        argsFromPanel.fileVersion === "HEAD" ? `HEAD:${f.path}` : f.path
      ),
    spec: argsFromPanel.codingConvention
      ? getCodingConventionPath(argsFromPanel.codingConvention, workspaceRoot)
      : undefined,
    template: "files",
  };

  return printPromptArgs;
}
