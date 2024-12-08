import { ChatPanel } from "../ChatPanel.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { OpenChatEvent } from "../types.js";

export async function handleOpenChat(
  chatPanel: ChatPanel,
  message: OpenChatEvent,
  workspaceRoot: string
): Promise<void> {
  const navigate = createChatNavigator(chatPanel);
  await navigate("/chat", {
    conversation: message.conversation,
    isNew: message.isNew,
  });
}
