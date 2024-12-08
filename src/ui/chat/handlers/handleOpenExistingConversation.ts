import { ChatPanel } from "../ChatPanel.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { OpenExistingConversationEvent } from "../types.js";

export async function handleOpenExistingConversation(
  chatPanel: ChatPanel,
  message: OpenExistingConversationEvent
): Promise<void> {
  const navigate = createChatNavigator(chatPanel);

  await navigate("/chat", {
    conversation: message.conversation,
    isNew: false,
  });
}
