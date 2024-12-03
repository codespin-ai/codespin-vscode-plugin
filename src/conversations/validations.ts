// validations.ts
import * as fs from "fs/promises";
import * as path from "path";
import { Conversation, Message, ContentItem } from "./types.js";
import { ConversationsFile } from "./fileTypes.js";

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

export function validateConversation(data: unknown): data is Conversation {
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

export function validateConversationsStructure(
  data: unknown
): data is ConversationsFile {
  if (!data || typeof data !== "object") {
    return false;
  }

  const file = data as ConversationsFile;

  if (
    typeof file.lastFileNumber !== "number" ||
    file.lastFileNumber < 1 ||
    file.lastFileNumber > 200 ||
    !Array.isArray(file.conversations)
  ) {
    return false;
  }

  // Check structure of each conversation entry
  if (
    !file.conversations.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        typeof c.timestamp === "number" &&
        typeof c.model === "string" &&
        (c.codingConvention === null ||
          typeof c.codingConvention === "string") &&
        Array.isArray(c.includedFiles) &&
        c.includedFiles.every((f) => typeof f.path === "string") &&
        typeof c.fileName === "string" &&
        c.fileName.startsWith("conversation_") &&
        c.fileName.endsWith(".json")
    )
  ) {
    return false;
  }

  // Check for duplicate IDs
  const ids = new Set(file.conversations.map((c) => c.id));
  if (ids.size !== file.conversations.length) {
    return false;
  }

  return true;
}
