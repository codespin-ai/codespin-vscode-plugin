// validations.ts
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
      return typeof content.path === "string";
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
      if (item.type === "text") return typeof item.text === "string";
      if (item.type === "image") return typeof item.path === "string";
      if (item.type === "files") {
        return Array.isArray(item.includedFiles);
      }
      return false;
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
    conv.messages.every(validateMessage)
  );
}

export function validateConversationsStructure(
  data: unknown
): data is ConversationsFile {
  if (!data || typeof data !== "object") {
    return false;
  }

  const file = data as ConversationsFile;

  if (!Array.isArray(file.conversations)) {
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
        (c.codingConvention === null || typeof c.codingConvention === "string")
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
