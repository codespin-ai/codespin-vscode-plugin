import { GenerateArgs as CodeSpinGenerateArgs } from "codespin/dist/commands/generate/index.js";
import { getModel } from "codespin/dist/settings/getModel.js";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { getCodingConventionPath } from "../../settings/conventions/getCodingConventionPath.js";
import { getProviderConfigPath } from "../../settings/provider/getProviderConfigPath.js";
import { GenerateUserInput } from "./types.js";
import {
  EditConfigPageProps,
  SupportedProviders,
} from "./html/pages/provider/EditConfig.js";

export type MissingProviderConfigArgs = {
  status: "missing_provider_config";
  providerConfigArgs: EditConfigPageProps;
};

export type CanGenerateArgs = {
  status: "can_generate";
  args: CodeSpinGenerateArgs;
};

export type GetGenerateArgs = MissingProviderConfigArgs | CanGenerateArgs;

export async function getGenerateArgs(
  generateUserInput: GenerateUserInput,
  workspaceRoot: string
): Promise<GetGenerateArgs> {
  const modelDescription = await getModelDescription(workspaceRoot);

  const configFilePath = await getProviderConfigPath(
    modelDescription.provider,
    workspaceRoot
  );

  if (configFilePath) {
    const codespinGenerateArgs: CodeSpinGenerateArgs = {
      prompt: generateUserInput.prompt,
      model: generateUserInput.model,
      write: false,
      include: generateUserInput.includedFiles.map((f) => f.path),
      spec: generateUserInput.codingConvention
        ? await getCodingConventionPath(
            generateUserInput.codingConvention,
            workspaceRoot
          )
        : undefined,
      reloadProviderConfig: true,
    };

    const canGenerateArgs: CanGenerateArgs = {
      status: "can_generate",
      args: codespinGenerateArgs,
    };

    return canGenerateArgs;
  } else {
    const missingConfigResult: MissingProviderConfigArgs = {
      status: "missing_provider_config",
      providerConfigArgs: {
        provider: modelDescription.provider as SupportedProviders,
        generateUserInput: generateUserInput,
      },
    };
    return missingConfigResult;
  }
}

export async function getModelDescription(workspaceRoot: string) {
  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);
  return await getModel([codespinConfig.model], codespinConfig);
}
