// fileTypes.ts
import { ConversationSummary } from "./types.js";

export interface ConversationsFile {
 lastFileNumber: number;
 conversations: ConversationSummary[];
}

export function getConversationFileName(id: number): string {
 return `conversation_${id}.json`;
}

export function getNextFileNumber(current: number): number {
 return current >= 200 ? 1 : current + 1;
}

// Maps 0-based position to file number, handling wraparound
export function getFileNumberForPosition(lastFileNumber: number, position: number): number {
 return ((lastFileNumber - position) + 200) % 200 + 1;
}