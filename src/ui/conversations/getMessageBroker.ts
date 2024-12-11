import { BrokerType, createMessageBroker } from "../../ipc/messageBroker.js";
import { ConversationsViewProvider } from "./ConversationsViewProvider.js";
import { handleWebviewReady } from "./handlers/handleWebviewReady.js";
import { handleNewConversation } from "./handlers/handleNewConversation.js";
import { handleInitialize } from "./handlers/handleInitialize.js";
import {
  WebViewReadyEvent,
  NewConversationEvent,
  InitializeEvent,
} from "./types.js";

export function getMessageBroker(
  provider: ConversationsViewProvider,
  workspaceRoot: string
) {
  return createMessageBroker()
    .attachHandler("webviewReady", (message: WebViewReadyEvent) =>
      handleWebviewReady(provider, workspaceRoot)
    )
    .attachHandler("newConversation", (message: NewConversationEvent) =>
      handleNewConversation(provider, workspaceRoot)
    )
    .attachHandler("initialize", (message: InitializeEvent) =>
      handleInitialize(provider, workspaceRoot)
    );
}

export type ConversationsViewProviderBrokerType = BrokerType<
  typeof getMessageBroker
>;
