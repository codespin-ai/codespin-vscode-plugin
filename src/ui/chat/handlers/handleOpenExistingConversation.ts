import { navigateTo } from "../../navigateTo.js";
import { ChatPanel } from "../ChatPanel.js";
import { OpenExistingConversationEvent } from "../types.js";

export async function handleOpenExistingConversation(
  chatPanel: ChatPanel,
  message: OpenExistingConversationEvent
): Promise<void> {
  await navigateTo(chatPanel, "/chat", { conversation: message.conversation });
}
