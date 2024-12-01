import { ConversationSummary } from "../../../../../conversations/types.js";
import { BrokerType, createMessageBroker } from "../../../../../messaging/messageBroker.js";
import { UpdateConversationsEvent } from "../../../types.js";

export function getMessageBroker(
  setEntries: (value: React.SetStateAction<ConversationSummary[]>) => void
) {
  return createMessageBroker().attachHandler(
    "updateConversations",
    async (message: UpdateConversationsEvent) => {
      setEntries(message.entries);
    }
  );
}

export type ConversationsPageBrokerType = BrokerType<typeof getMessageBroker>;
