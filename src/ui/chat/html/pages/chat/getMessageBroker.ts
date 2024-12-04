import { Message } from "../../../../../conversations/types.js";
import {
  BrokerType,
  createMessageBroker,
} from "../../../../../messaging/messageBroker.js";
import {
  FileResultStreamEvent,
  ProcessedStreamingFileParseResult,
} from "../../../types.js";

export function getMessageBroker({
  setIsGenerating,
  onFileResult,
  setMessages,
}: {
  setIsGenerating: (value: boolean) => void;
  onFileResult: (result: ProcessedStreamingFileParseResult) => void;
  setMessages: (value: React.SetStateAction<Message[]>) => void;
}) {
  return createMessageBroker()
    .attachHandler(
      "fileResultStream",
      async (message: FileResultStreamEvent) => {
        onFileResult(message.data);
      }
    )
    .attachHandler("messages", async (messages: Message[]) => {
      setMessages(messages);
    })
    .attachHandler("done", async () => {
      setIsGenerating(false);
    });
}

export type ChatPageBrokerType = BrokerType<typeof getMessageBroker>;
