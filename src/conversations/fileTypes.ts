// fileTypes.ts
import { ConversationSummary } from "./types.js";

export interface ConversationsFile {
  lastFileNumber: number;
  conversations: (ConversationSummary & { fileName: string })[];
}

export function getConversationFileName(id: number): string {
  return `conversation_${id}.json`;
}

export function getNextFileNumber(current: number): number {
  return current >= 200 ? 1 : current + 1;
}
