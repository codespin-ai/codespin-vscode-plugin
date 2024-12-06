import { editOpenAIConfig as updateOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { EditOpenAIConfigEvent } from "../types.js";
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
