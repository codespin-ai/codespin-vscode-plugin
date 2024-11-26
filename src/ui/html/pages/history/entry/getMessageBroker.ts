import {
  BrokerType,
  createMessageBroker,
} from "../../../../../messaging/messageBroker.js";
import { GeneratedCommitMessageEvent } from "../../../../panels/historyEntry/types.js";

export function getMessageBroker({
  setCommitMessage,
  setShowCommitMessage,
  setIsCommitted,
}: {
  setCommitMessage: (value: React.SetStateAction<string>) => void;
  setShowCommitMessage: (value: React.SetStateAction<boolean>) => void;
  setIsCommitted: (value: React.SetStateAction<boolean>) => void;
}) {
  return createMessageBroker()
    .attachHandler(
      "generatedCommitMessage",
      async (message: GeneratedCommitMessageEvent) => {
        setCommitMessage(message.message);
        setShowCommitMessage(true);
      }
    )
    .attachHandler("committed", async () => {
      setIsCommitted(true);
    });
}

export type HistoryEntryPageBrokerType = BrokerType<typeof getMessageBroker>;
