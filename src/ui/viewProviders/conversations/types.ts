import { ConversationSummary } from "../../../conversations/types.js";

export type UpdateConversationsArgs = {
  entries: ConversationSummary[];
};

export type UpdateConversationsEvent = {
  type: "updateConversations";
} & UpdateConversationsArgs;
