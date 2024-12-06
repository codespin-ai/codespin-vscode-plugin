import { editOpenAIConfig as updateOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
import { EditOpenAIConfigEvent } from "../../../settings/provider/types.js";
import { ChatPanel } from "../ChatPanel.js";
import { handleStartChat } from "./handleStartChat.js";

export async function handleEditOpenAIConfig(
  message: EditOpenAIConfigEvent,
  chatPanel: ChatPanel,
  workspaceRoot: string
): Promise<void> {
  await updateOpenAIConfig(message);
  await handleStartChat(
    { type: "startChat", ...message.startChatUserInput },
    chatPanel,
    workspaceRoot
  );
}
