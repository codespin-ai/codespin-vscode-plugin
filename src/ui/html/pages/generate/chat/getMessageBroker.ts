import {
  BrokerType,
  createMessageBroker,
} from "../../../../../messaging/messageBroker.js";
import {
  FileResultStreamEvent,
  PromptCreatedEvent,
  ResponseStreamEvent,
} from "../../../../panels/generate/types.js";

export function getMessageBroker({
  setCurrentMessage,
  setBytesReceived,
  setIsGenerating,
}: {
  setCurrentMessage: (value: string) => void;
  setBytesReceived: (value: React.SetStateAction<number>) => void;
  setIsGenerating: (value: boolean) => void;
}) {
  let accumulatedResponse = "";

  return createMessageBroker()
    .attachHandler("promptCreated", async (message: PromptCreatedEvent) => {
      // Reset accumulated response when new prompt starts
      accumulatedResponse = "";
      setCurrentMessage("");
      setBytesReceived(0);
      setIsGenerating(true);
    })
    .attachHandler("responseStream", async (message: ResponseStreamEvent) => {
      const { data: chunk } = message;
      accumulatedResponse += chunk;
      setCurrentMessage(accumulatedResponse);
      setBytesReceived(accumulatedResponse.length);
    })
    .attachHandler("fileResultStream", async (message: FileResultStreamEvent) => {
      // FIXME
    })

    .attachHandler("done", async () => {
      setIsGenerating(false);
      // Final accumulated response is already set via responseStream
      // Reset for next message
      accumulatedResponse = "";
    });
}

export type InvokePageBrokerType = BrokerType<typeof getMessageBroker>;
