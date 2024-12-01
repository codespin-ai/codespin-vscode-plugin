import { ConversationSummary } from "./types.js";

export interface ConversationsFile {
  lastFileNumber: number;
  conversations: ConversationSummary[];
}

export function getConversationFileName(fileNumber: number): string {
  return `conversation_${fileNumber}.json`;
}

export function getNextFileNumber(current: number): number {
  return current >= 200 ? 1 : current + 1;
}
