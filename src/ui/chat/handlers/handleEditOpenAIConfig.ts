import { editOpenAIConfig as updateOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { EditOpenAIConfigEvent } from "../types.js";

export async function handleEditOpenAIConfig(
  chatPanel: ChatPanel,
  message: EditOpenAIConfigEvent,
  workspaceRoot: string
): Promise<void> {
  await updateOpenAIConfig(message);
  const navigate = createChatNavigator(chatPanel);
  await navigate("/chat", { conversation: message.conversation, isNew: true });
}
