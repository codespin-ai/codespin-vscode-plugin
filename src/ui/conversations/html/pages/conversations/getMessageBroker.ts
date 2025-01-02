import { ConversationSummary } from "../../../../../conversations/types.js";
import {
  BrokerType,
  createMessageBroker,
} from "../../../../../ipc/messageBroker.js";
import { UpdateConversationsEvent } from "../../../types.js";

export function getMessageBroker(
  setEntries: (value: ConversationSummary[]) => void
) {
  return createMessageBroker().attachHandler(
    "updateConversations",
    async (message: UpdateConversationsEvent) => {
      setEntries(message.entries);
    }
  );
}

export type ConversationsPageBrokerType = BrokerType<typeof getMessageBroker>;
