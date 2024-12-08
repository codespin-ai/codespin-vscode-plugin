import { GenerateArgs as CodeSpinGenerateArgs } from "codespin/dist/commands/generate/index.js";
import { getModel } from "codespin/dist/settings/getModel.js";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import {
  Conversation,
  UserMessage,
  UserTextContent,
} from "../../conversations/types.js";
import { getCodingConventionPath } from "../../settings/conventions/getCodingConventionPath.js";
import { getProviderConfigPath } from "../../settings/provider/getProviderConfigPath.js";
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
  conversation: Conversation,
  workspaceRoot: string
): Promise<GetGenerateArgs> {
  const modelDescription = await getModelDescription(workspaceRoot);

  const configFilePath = await getProviderConfigPath(
    modelDescription.provider,
    workspaceRoot
  );

  if (configFilePath) {
    const userMessage = conversation.messages[0] as UserMessage;
    const prompt = (userMessage.content[0] as UserTextContent).text;
    const includedFiles =
      userMessage.content[1]?.type === "files"
        ? userMessage.content[1].includedFiles.map((file) => file.path)
        : [];

    const codespinGenerateArgs: CodeSpinGenerateArgs = {
      prompt,
      model: conversation.model,
      write: false,
      include: includedFiles,
      spec: conversation.codingConvention
        ? await getCodingConventionPath(
            conversation.codingConvention,
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
        conversation,
      },
    };
    return missingConfigResult;
  }
}

export async function getModelDescription(workspaceRoot: string) {
  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);
  return await getModel([codespinConfig.model], codespinConfig);
}
