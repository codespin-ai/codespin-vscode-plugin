import { Conversation, Message } from "../../../../../conversations/types.js";
import {
  BrokerType,
  createMessageBroker,
} from "../../../../../ipc/messageBroker.js";
import {
  FileResultStreamEvent,
  ProcessedStreamingFileParseResult,
} from "./fileStreamProcessor.js";

export function getMessageBroker({
  setIsGenerating,
  onFileResult,
  setCurrentConversation,
}: {
  setIsGenerating: (value: boolean) => void;
  onFileResult: (result: ProcessedStreamingFileParseResult) => void;
  setCurrentConversation: (
    setter: (prev: Conversation) => Conversation
  ) => void;
}) {
  return createMessageBroker()
    .attachHandler(
      "fileResultStream",
      async (message: FileResultStreamEvent) => {
        onFileResult(message.data);
      }
    )
    .attachHandler("messages", async (messages: Message[]) => {
      setCurrentConversation((prev) => ({ ...prev, messages }));
    })
    .attachHandler("done", async () => {
      setIsGenerating(false);
    });
}

export type ChatPageBrokerType = BrokerType<typeof getMessageBroker>;
