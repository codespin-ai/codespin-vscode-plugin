import {
  BrokerType,
  createMessageBroker,
} from "../../../../messaging/messageBroker.js";
import { HistoryEntry, UpdateHistoryEvent } from "../../../viewProviders/history/types.js";

export function getMessageBroker(
  setEntries: (value: React.SetStateAction<HistoryEntry[]>) => void
) {
  return createMessageBroker().attachHandler(
    "updateHistory",
    async (message: UpdateHistoryEvent) => {
      setEntries(message.entries);
    }
  );
}

export type HistoryPageBrokerType = BrokerType<typeof getMessageBroker>;
