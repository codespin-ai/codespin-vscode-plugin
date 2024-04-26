import {
  GenerateArgs as CodespinGenerateArgs,
  GenerateArgs,
} from "codespin/dist/commands/generate.js";
import * as path from "path";
import { getAPIConfigPath } from "../../../settings/api/getAPIConfigPath.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { GenerateUserInput } from "./types.js";
import { getHistoryItemDir } from "../../../settings/history/getHistoryItemDir.js";
import { GeneratePanel } from "./GeneratePanel.js";

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
  generatePanel: GeneratePanel,
  workspaceRoot: string
): Promise<GetGenerateArgsResult> {
  const userInputFromPanel = generatePanel.userInput!;
  const [api] = userInputFromPanel.model.split(":");

  const configFilePath = await getAPIConfigPath(api, workspaceRoot);
  const dirName = Date.now().toString();

  if (configFilePath) {
    const historyDirPath = getHistoryItemDir(dirName, workspaceRoot);

    const promptFilePath = path.join(historyDirPath, "prompt.txt");

    const codespinGenerateArgs: GenerateArgs = {
      promptFile: promptFilePath,
      out:
        userInputFromPanel.codegenTargets !== ":prompt"
          ? userInputFromPanel.codegenTargets
          : undefined,
      model: userInputFromPanel.model,
      write: true,
      include: userInputFromPanel.includedFiles
        .filter((f) => f.includeOption === "source")
        .map((f) =>
          userInputFromPanel.fileVersion === "HEAD" ? `HEAD:${f.path}` : f.path
        ),
      declare: userInputFromPanel.includedFiles
        .filter((f) => f.includeOption === "declaration")
        .map((f) => f.path),
      spec: userInputFromPanel.codingConvention
        ? await getCodingConventionPath(
            userInputFromPanel.codingConvention,
            workspaceRoot
          )
        : undefined,
      template: userInputFromPanel.outputKind === "diff" ? "diff" : "default",
      cancelCallback: (cancel: () => void) => {
        generatePanel.cancelGeneration = cancel;
      },
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
