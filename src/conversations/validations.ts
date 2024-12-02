// validations.ts
import * as fs from "fs/promises";
import * as path from "path";
import { ConversationsFile } from "./fileTypes.js";
import { Conversation } from "./types.js";

function validateConversation(data: unknown): data is Conversation {
  if (!data || typeof data !== "object") return false;
  const conv = data as Conversation;
  return (
    typeof conv.id === "string" &&
    typeof conv.title === "string" &&
    typeof conv.timestamp === "number" &&
    typeof conv.model === "string" &&
    (conv.codingConvention === null ||
      typeof conv.codingConvention === "string") &&
    Array.isArray(conv.messages) &&
    Array.isArray(conv.includedFiles)
  );
}

function validateConversationsFile(data: unknown): data is ConversationsFile {
  if (!data || typeof data !== "object") return false;
  const file = data as ConversationsFile;
  return (
    typeof file.lastFileNumber === "number" &&
    Array.isArray(file.conversations) &&
    file.conversations.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        typeof c.timestamp === "number" &&
        typeof c.model === "string" &&
        (c.codingConvention === null ||
          typeof c.codingConvention === "string") &&
        Array.isArray(c.includedFiles)
    )
  );
}

export async function clearAllData(conversationsDir: string): Promise<void> {
  try {
    const files = await fs.readdir(conversationsDir);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(conversationsDir, file)))
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function validateConversationData(
  conversationsDir: string,
  data: unknown
): Promise<boolean> {
  if (!validateConversation(data)) {
    await clearAllData(conversationsDir);
    return false;
  }
  return true;
}

export async function validateConversationsFileData(
  conversationsDir: string,
  data: unknown
): Promise<boolean> {
  if (!validateConversationsFile(data)) {
    await clearAllData(conversationsDir);
    return false;
  }
  return true;
}