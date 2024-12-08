import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import {
  Message,
  ConversationSummary,
  ConversationsFile,
  Conversation,
} from "./types.js";

function getInitialTitle(messages: Message[]): string {
  const firstMessage = messages[0];
  if (firstMessage?.role === "user") {
    const firstContent = firstMessage.content[0];
    if ("text" in firstContent) {
      return firstContent.text.slice(0, 128);
    }
  }
  return "Untitled";
}

function getNextId(conversations: ConversationSummary[]): string {
  if (conversations.length === 0) {
    return "1";
  }
  // Since we unshift new conversations, first one has the highest ID
  const lastId = parseInt(conversations[0].id);
  return (lastId + 1).toString();
}

export type CreateConversationParams = {
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | undefined;
  initialMessage: Message;
};

export async function createConversation(
  {
    title: maybeTitle,
    timestamp,
    model,
    codingConvention,
    initialMessage,
  }: CreateConversationParams,
  workspaceRoot: string
): Promise<string> {
  // Now returns the created ID
  const conversationsDir = path.join(
    getCodeSpinDir(workspaceRoot),
    "conversations"
  );
  const summariesPath = path.join(conversationsDir, "conversations.json");

  let conversationsFile: ConversationsFile;
  try {
    const content = await fs.readFile(summariesPath, "utf-8");
    conversationsFile = JSON.parse(content) as ConversationsFile;
  } catch {
    conversationsFile = {
      conversations: [],
    };
  }

  // If we have 200 conversations, delete the oldest one (last in the array)
  if (conversationsFile.conversations.length >= 200) {
    const oldest = conversationsFile.conversations.pop();
    if (oldest) {
      const oldDirPath = path.join(conversationsDir, oldest.id);
      await fs.rm(oldDirPath, { recursive: true, force: true });
    }
  }

  const title = maybeTitle || getInitialTitle([initialMessage]);
  const id = getNextId(conversationsFile.conversations);

  const conversationDirPath = path.join(conversationsDir, id);
  const conversationFilePath = path.join(
    conversationDirPath,
    "conversation.json"
  );

  // Create conversation directory
  await fs.mkdir(conversationDirPath, { recursive: true });

  const summary: ConversationSummary = {
    id,
    title,
    timestamp,
    model,
    codingConvention,
  };

  conversationsFile.conversations.unshift(summary);

  await fs.writeFile(summariesPath, JSON.stringify(conversationsFile, null, 2));

  const conversation: Conversation = {
    id,
    title,
    timestamp,
    model,
    codingConvention,
    messages: [initialMessage],
  };

  await fs.writeFile(
    conversationFilePath,
    JSON.stringify(conversation, null, 2)
  );

  return id;
}
