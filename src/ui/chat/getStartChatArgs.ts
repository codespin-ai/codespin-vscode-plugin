import { GenerateArgs as CodeSpinGenerateArgs } from "codespin/dist/commands/generate/index.js";
import { getModel } from "codespin/dist/settings/getModel.js";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { ChatPanel } from "./ChatPanel.js";
import { getProviderConfigPath } from "../../settings/provider/getProviderConfigPath.js";
import { getCodingConventionPath } from "../../settings/conventions/getCodingConventionPath.js";
import { UserFileContent, UserTextContent } from "../../conversations/types.js";

type GetStartChatArgsResult =
  | {
      status: "missing_config";
      provider: string;
    }
  | {
      status: "can_start_chat";
      args: CodeSpinGenerateArgs;
    };

export async function getStartChatArgs(
  chatPanel: ChatPanel,
  workspaceRoot: string
): Promise<GetStartChatArgsResult> {
  const userInputFromPanel = chatPanel.userInput!;

  const modelDescription = await getModelDescription(workspaceRoot);

  const configFilePath = await getProviderConfigPath(
    modelDescription.provider,
    workspaceRoot
  );

  if (configFilePath) {
    const userText = userInputFromPanel.content.find(
      (c): c is UserTextContent => c.type === "text"
    );

    const fileContents = userInputFromPanel.content.filter(
      (c): c is UserFileContent => c.type === "file"
    );

    const codespinGenerateArgs: CodeSpinGenerateArgs = {
      prompt: userText?.text ?? "",
      model: userInputFromPanel.model,
      write: false,
      include: fileContents.map((f) => f.path),
      spec: userInputFromPanel.codingConvention
        ? await getCodingConventionPath(
            userInputFromPanel.codingConvention,
            workspaceRoot
          )
        : undefined,
      reloadProviderConfig: true,
      cancelCallback: (cancel: () => void) => {
        chatPanel.cancelGeneration = cancel;
      },
    };

    return {
      status: "can_start_chat",
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

export async function getModelDescription(workspaceRoot: string) {
  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);

  const modelDescription = await getModel(
    [codespinConfig.model],
    codespinConfig
  );

  return modelDescription;
}
