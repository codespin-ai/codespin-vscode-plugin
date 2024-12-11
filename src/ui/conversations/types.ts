import { ConversationSummary } from "../../conversations/types.js";

export type WebViewReadyEvent = {
  type: "webviewReady";
};

export type NewConversationEvent = {
  type: "newConversation";
};

export type InitializeEvent = {
  type: "initialize";
};

export type UpdateConversationsArgs = {
  entries: ConversationSummary[];
};

export type UpdateConversationsEvent = {
  type: "updateConversations";
} & UpdateConversationsArgs;
