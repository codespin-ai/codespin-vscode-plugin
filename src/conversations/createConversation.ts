// createConversation.ts
import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { Message, ConversationSummary, ConversationsFile } from "./types.js";

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

export async function createConversation(params: {
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
  initialMessage: Message;
  workspaceRoot: string;
}): Promise<string> {
  // Now returns the created ID
  const conversationsDir = path.join(
    getCodeSpinDir(params.workspaceRoot),
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

  const title = params.title || getInitialTitle([params.initialMessage]);
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
    timestamp: params.timestamp,
    model: params.model,
    codingConvention: params.codingConvention,
  };

  conversationsFile.conversations.unshift(summary);

  await fs.writeFile(summariesPath, JSON.stringify(conversationsFile, null, 2));

  const conversation = {
    ...params,
    id,
    title,
    messages: [params.initialMessage],
  };

  await fs.writeFile(
    conversationFilePath,
    JSON.stringify(conversation, null, 2)
  );

  return id;
}
