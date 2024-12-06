import { editOpenAIConfig as updateOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { EditOpenAIConfigEvent } from "../types.js";
import { handleStartChat } from "./handleStartChat.js";

export async function handleEditOpenAIConfig(
  chatPanel: ChatPanel,
  message: EditOpenAIConfigEvent,
  workspaceRoot: string
): Promise<void> {
  await updateOpenAIConfig(message);
  await handleStartChat(
    chatPanel,
    { type: "startChat", ...message.startChatUserInput },
    workspaceRoot
  );
}
