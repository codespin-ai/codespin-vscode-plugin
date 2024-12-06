// fileTypes.ts
import { ConversationSummary } from "./types.js";

export interface ConversationsFile {
  conversations: ConversationSummary[];
}

export function getConversationFilePath(id: string): string {
  return "conversation.json";
}
