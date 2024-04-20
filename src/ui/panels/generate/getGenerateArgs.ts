import {
  GenerateArgs as CodespinGenerateArgs,
  GenerateArgs,
} from "codespin/dist/commands/generate.js";
import * as path from "path";
import { getAPIConfigPath } from "../../../settings/api/getAPIConfigPath.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { GenerateUserInput } from "./types.js";
import { getHistoryItemDir } from "../../../settings/history/getHistoryItemDir.js";

type GetGenerateArgsResult =
  | {
      status: "missing_config";
      api: string;
    }
  | {
      status: "can_generate";
      args: CodespinGenerateArgs;
      dirName: string;
      promptFilePath: string;
    };

export async function getGenerateArgs(
  argsFromPanel: GenerateUserInput,
  cancelCallback: (cancel: () => void) => void,
  workspaceRoot: string
): Promise<GetGenerateArgsResult> {
  const [api] = argsFromPanel.model.split(":");

  const configFilePath = await getAPIConfigPath(api, workspaceRoot);
  const dirName = Date.now().toString();

  if (configFilePath) {
    const historyDirPath = getHistoryItemDir(dirName, workspaceRoot);

    const promptFilePath = path.join(historyDirPath, "prompt.txt");

    const codespinGenerateArgs: GenerateArgs = {
      promptFile: promptFilePath,
      out:
        argsFromPanel.codegenTargets !== ":prompt"
          ? argsFromPanel.codegenTargets
          : undefined,
      model: argsFromPanel.model,
      write: true,
      include: argsFromPanel.includedFiles
        .filter((f) => f.includeOption === "source")
        .map((f) =>
          argsFromPanel.fileVersion === "HEAD" ? `HEAD:${f.path}` : f.path
        ),
      declare: argsFromPanel.includedFiles
        .filter((f) => f.includeOption === "declaration")
        .map((f) => f.path),
      spec: argsFromPanel.codingConvention
        ? await getCodingConventionPath(
            argsFromPanel.codingConvention,
            workspaceRoot
          )
        : undefined,
      template: argsFromPanel.outputKind === "diff" ? "diff" : "default",
      cancelCallback,
    };

    return {
      status: "can_generate",
      args: codespinGenerateArgs,
      dirName,
      promptFilePath,
    };
  }
  // config file doesn't exist.
  else {
    return {
      status: "missing_config",
      api,
    };
  }
}
