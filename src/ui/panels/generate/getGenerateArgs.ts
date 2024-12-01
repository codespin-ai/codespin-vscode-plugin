import { GenerateArgs as CodeSpinGenerateArgs } from "codespin/dist/commands/generate/index.js";
import { getModel } from "codespin/dist/settings/getModel.js";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { getProviderConfigPath } from "../../../settings/provider/getProviderConfigPath.js";
import { GeneratePanel } from "./GeneratePanel.js";

type GetGenerateArgsResult =
  | {
      status: "missing_config";
      provider: string;
    }
  | {
      status: "can_generate";
      args: CodeSpinGenerateArgs;
    };

export async function getGenerateArgs(
  generatePanel: GeneratePanel,
  workspaceRoot: string
): Promise<GetGenerateArgsResult> {
  const userInputFromPanel = generatePanel.userInput!;

  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);
  const modelDescription = await getModel(
    [codespinConfig.model],
    codespinConfig
  );

  const configFilePath = await getProviderConfigPath(
    modelDescription.provider,
    workspaceRoot
  );

  if (configFilePath) {
    const codespinGenerateArgs: CodeSpinGenerateArgs = {
      prompt: userInputFromPanel.prompt,
      model: userInputFromPanel.model,
      write: false,
      include: userInputFromPanel.includedFiles.map((f) => f.path),
      spec: userInputFromPanel.codingConvention
        ? await getCodingConventionPath(
            userInputFromPanel.codingConvention,
            workspaceRoot
          )
        : undefined,
      cancelCallback: (cancel: () => void) => {
        generatePanel.cancelGeneration = cancel;
      },
    };

    return {
      status: "can_generate",
      args: codespinGenerateArgs,
    };
  }
  // config file doesn't exist.
  else {
    return {
      status: "missing_config",
      provider: modelDescription.provider,
    };
  }
}
