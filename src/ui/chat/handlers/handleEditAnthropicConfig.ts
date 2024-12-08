import { editAnthropicConfig as updateAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { EditAnthropicConfigEvent } from "../types.js";

export async function handleEditAnthropicConfig(
  chatPanel: ChatPanel,
  message: EditAnthropicConfigEvent,
  workspaceRoot: string
): Promise<void> {
  await updateAnthropicConfig(message);

  const navigate = createChatNavigator(chatPanel);
  await navigate("/chat", { conversation: message.conversation, isNew: true });

}
