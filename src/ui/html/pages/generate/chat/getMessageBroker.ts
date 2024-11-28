import {
  BrokerType,
  createMessageBroker,
} from "../../../../../messaging/messageBroker.js";
import {
  FileResultStreamEvent,
  ProcessedStreamingFileParseResult,
  PromptCreatedEvent,
  ResponseStreamEvent,
} from "../../../../panels/generate/types.js";

export function getMessageBroker({
  setIsGenerating,
  onFileResult,
}: {
  setIsGenerating: (value: boolean) => void;
  onFileResult: (result: ProcessedStreamingFileParseResult) => void;
}) {
  return createMessageBroker()
    .attachHandler("promptCreated", async (message: PromptCreatedEvent) => {
      setIsGenerating(true);
    })
    .attachHandler("responseStream", async (message: ResponseStreamEvent) => {
      onFileResult({
        type: "text",
        content: message.data,
      });
    })
    .attachHandler(
      "fileResultStream",
      async (message: FileResultStreamEvent) => {
        onFileResult(message.data);
      }
    )
    .attachHandler("done", async () => {
      setIsGenerating(false);
    });
}

export type InvokePageBrokerType = BrokerType<typeof getMessageBroker>;
