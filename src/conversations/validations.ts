// validations.ts
import * as fs from "fs/promises";
import * as path from "path";
import { ConversationsFile, getConversationFileName } from "./fileTypes.js";
import { Conversation, Message, ContentItem } from "./types.js";

function validateContentItem(item: unknown): item is ContentItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const content = item as ContentItem;

  if (!("type" in content) || !("id" in content)) {
    return false;
  }

  switch (content.type) {
    case "file-heading": {
      return (
        typeof content.path === "string" && typeof content.content === "string"
      );
    }
    case "text": {
      return typeof content.content === "string";
    }
    case "code": {
      return (
        typeof content.path === "string" &&
        typeof content.content === "string" &&
        typeof content.html === "string"
      );
    }
    case "markdown": {
      return (
        typeof content.content === "string" && typeof content.html === "string"
      );
    }
    default: {
      return false;
    }
  }
}

function validateMessage(msg: unknown): msg is Message {
  if (!msg || typeof msg !== "object") {
    return false;
  }

  const message = msg as Message;

  if (
    !("role" in message) ||
    !("content" in message) ||
    !Array.isArray(message.content)
  ) {
    return false;
  }

  if (message.role === "user") {
    return message.content.every((item) => {
      return (
        ("text" in item && typeof item.text === "string") ||
        ("path" in item && typeof item.path === "string")
      );
    });
  }

  if (message.role === "assistant") {
    return message.content.every(validateContentItem);
  }

  return false;
}

function validateConversation(data: unknown): data is Conversation {
  if (!data || typeof data !== "object") {
    return false;
  }

  const conv = data as Conversation;

  return (
    typeof conv.id === "string" &&
    typeof conv.title === "string" &&
    typeof conv.timestamp === "number" &&
    typeof conv.model === "string" &&
    (conv.codingConvention === null ||
      typeof conv.codingConvention === "string") &&
    Array.isArray(conv.messages) &&
    conv.messages.every(validateMessage) &&
    Array.isArray(conv.includedFiles) &&
    conv.includedFiles.every((f) => typeof f.path === "string")
  );
}

async function validateConversationsFile(
  data: unknown,
  conversationsDir: string
): Promise<boolean> {
  if (!data || typeof data !== "object") {
    return false;
  }

  const file = data as ConversationsFile;

  if (
    typeof file.lastFileNumber !== "number" ||
    !Array.isArray(file.conversations) ||
    file.lastFileNumber < 0 ||
    file.lastFileNumber > 200
  ) {
    return false;
  }

  if (
    !file.conversations.every((c) => {
      return (
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        typeof c.timestamp === "number" &&
        typeof c.model === "string" &&
        (c.codingConvention === null ||
          typeof c.codingConvention === "string") &&
        Array.isArray(c.includedFiles) &&
        c.includedFiles.every((f) => typeof f.path === "string")
      );
    })
  ) {
    return false;
  }

  const ids = new Set(file.conversations.map((c) => c.id));
  if (ids.size !== file.conversations.length) {
    return false;
  }

  const files = await fs.readdir(conversationsDir);
  const expectedFiles = new Set([
    "conversations.json",
    ...Array.from({ length: file.conversations.length }, (_, i) => {
      const fileNumber = ((file.lastFileNumber - i + 200) % 200) + 1;
      return getConversationFileName(fileNumber);
    }),
  ]);

  return (
    files.length === expectedFiles.size &&
    files.every((f) => expectedFiles.has(f))
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
  if (!(await validateConversationsFile(data, conversationsDir))) {
    await clearAllData(conversationsDir);
    return false;
  }
  return true;
}
