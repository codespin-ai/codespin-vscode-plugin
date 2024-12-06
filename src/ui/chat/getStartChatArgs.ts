import { GenerateArgs as CodeSpinGenerateArgs } from "codespin/dist/commands/generate/index.js";
import { getModel } from "codespin/dist/settings/getModel.js";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { getCodingConventionPath } from "../../settings/conventions/getCodingConventionPath.js";
import { getProviderConfigPath } from "../../settings/provider/getProviderConfigPath.js";
import { StartChatUserInput, ConfigPageState } from "./types.js";

export type GetStartChatArgsMissingConfigResult = {
  status: "missing_config";
  configPageState: ConfigPageState;
};

export type GetStartChatArgsOkResult = {
  status: "can_start_chat";
  args: CodeSpinGenerateArgs;
};

export type GetStartChatArgsResult =
  | GetStartChatArgsMissingConfigResult
  | GetStartChatArgsOkResult;

export async function getStartChatArgs(
  startChatInput: StartChatUserInput,
  workspaceRoot: string
): Promise<GetStartChatArgsResult> {
  const modelDescription = await getModelDescription(workspaceRoot);

  const configFilePath = await getProviderConfigPath(
    modelDescription.provider,
    workspaceRoot
  );

  if (configFilePath) {
    const codespinGenerateArgs: CodeSpinGenerateArgs = {
      prompt: startChatInput.prompt,
      model: startChatInput.model,
      write: false,
      include: startChatInput.includedFiles.map((f) => f.path),
      spec: startChatInput.codingConvention
        ? await getCodingConventionPath(
            startChatInput.codingConvention,
            workspaceRoot
          )
        : undefined,
      reloadProviderConfig: true,
    };

    const canstartChatArgs: GetStartChatArgsOkResult = {
      status: "can_start_chat",
      args: codespinGenerateArgs,
    };

    return canstartChatArgs;
  } else {
    const missingConfigResult: GetStartChatArgsMissingConfigResult = {
      status: "missing_config",
      configPageState: {
        provider: modelDescription.provider,
        returnTo: "/chat",
        startChatUserInput: startChatInput,
      },
    };
    return missingConfigResult;
  }
}

export async function getModelDescription(workspaceRoot: string) {
  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);
  return await getModel([codespinConfig.model], codespinConfig);
}
