import {
  BrokerType,
  createMessageBroker,
} from "../../../../../messaging/messageBroker.js";
import {
  PromptCreatedEvent,
  ResponseStreamEvent,
} from "../../../../panels/generate/types.js";

export function getMessageBroker({
  setPrompt,
  setData,
  setBytesReceived,
}: {
  setPrompt: (value: React.SetStateAction<string>) => void;
  setData: (value: React.SetStateAction<string>) => void;
  setBytesReceived: (value: React.SetStateAction<number>) => void;
}) {
  return createMessageBroker()
    .attachHandler("promptCreated", async (message: PromptCreatedEvent) => {
      setPrompt(message.prompt);
    })
    .attachHandler("responseStream", async (message: ResponseStreamEvent) => {
      const { data: chunk } = message;
      setData((data) => {
        setBytesReceived(data.length);
        return data + chunk;
      });
    });
}

export type InvokePageBrokerType = BrokerType<typeof getMessageBroker>;
