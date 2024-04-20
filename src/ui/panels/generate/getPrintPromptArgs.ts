import { GenerateArgs } from "codespin/dist/commands/generate.js";
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
      .filter((f) => f.includeOption === "source")
      .map((f) =>
        argsFromPanel.fileVersion === "HEAD" ? `HEAD:${f.path}` : f.path
      ),
    declare: argsFromPanel.includedFiles
      .filter((f) => f.includeOption === "declaration")
      .map((f) => f.path),
    spec: argsFromPanel.codingConvention
      ? getCodingConventionPath(argsFromPanel.codingConvention, workspaceRoot)
      : undefined,
    template: "files",
  };

  return printPromptArgs;
}
