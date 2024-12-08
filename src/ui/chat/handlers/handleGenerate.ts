import { InvalidCredentialsError } from "codespin/dist/errors.js";
import { ChatPanel } from "../ChatPanel.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { getGenerateArgs, getModelDescription } from "../getGenerateArgs.js";
import { invokeGenerate } from "../invokeGenerate.js";
import { GenerateEvent } from "../types.js";
import {
  EditConfigPageProps,
  SupportedProviders,
} from "../html/pages/provider/EditConfig.js";

export async function handleGenerate(
  chatPanel: ChatPanel,
  message: GenerateEvent,
  workspaceRoot: string
): Promise<void> {
  const generateArgs = await getGenerateArgs(message, workspaceRoot);

  switch (generateArgs.status) {
    case "can_generate":
      try {
        await invokeGenerate(
          chatPanel,
          generateArgs.args,
          message,
          workspaceRoot
        );
      } catch (ex) {
        if (ex instanceof InvalidCredentialsError) {
          const modelDescription = await getModelDescription(workspaceRoot);

          const configPageState: EditConfigPageProps = {
            provider: modelDescription.provider as SupportedProviders,
            generateUserInput: message,
          };

          const navigate = createChatNavigator(chatPanel);
          await navigate(`/provider/config/edit`, configPageState);
          break;
        }
        throw ex;
      }
      break;

    case "missing_provider_config":
      const navigate = createChatNavigator(chatPanel);
      await navigate(`/provider/config/edit`, generateArgs.providerConfigArgs);
      break;
  }
}
