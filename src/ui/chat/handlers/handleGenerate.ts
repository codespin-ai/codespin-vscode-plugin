import * as libllm from "libllm";
import { ChatPanel } from "../ChatPanel.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { getGenerateArgs } from "../getGenerateArgs.js";
import { EditConfigProps } from "../html/pages/provider/edit-config.js";
import { invokeGenerate } from "../invokeGenerate.js";
import { GenerateEvent } from "../types.js";

export async function handleGenerate(
  chatPanel: ChatPanel,
  message: GenerateEvent,
  workspaceRoot: string
): Promise<void> {
  const generateArgs = await getGenerateArgs(
    message.conversation,
    workspaceRoot
  );

  try {
    await invokeGenerate(
      chatPanel,
      message.conversation.id,
      generateArgs,
      workspaceRoot
    );
  } catch (ex) {
    if (ex instanceof libllm.errors.InvalidCredentialsError) {
      const api = await libllm.getAPIForModel(
        generateArgs.model,
        workspaceRoot
      );

      const configPageState: EditConfigProps = {
        provider: api.getProviderName(),
        conversation: message.conversation,
      };

      const navigate = createChatNavigator(chatPanel);
      await navigate(`/provider/config/edit`, configPageState);
    }
    throw ex;
  }
}
