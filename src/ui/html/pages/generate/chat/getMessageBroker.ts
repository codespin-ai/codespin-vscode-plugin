import {
  BrokerType,
  createMessageBroker,
} from "../../../../../messaging/messageBroker.js";
import {
  FileResultStreamEvent,
  ProcessedStreamingFileParseResult
} from "../../../../panels/generate/types.js";

export function getMessageBroker({
  setIsGenerating,
  onFileResult,
}: {
  setIsGenerating: (value: boolean) => void;
  onFileResult: (result: ProcessedStreamingFileParseResult) => void;
}) {
  return createMessageBroker()
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
