// addMessage.ts
import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { Message, Conversation } from "./types.js";
import { ConversationsFile, getConversationFilePath } from "./fileTypes.js";

export async function addMessage(params: {
  conversationId: string;
  message: Message;
  workspaceRoot: string;
}): Promise<void> {
  const conversationsDir = path.join(
    getCodeSpinDir(params.workspaceRoot),
    "conversations"
  );
  const summariesPath = path.join(conversationsDir, "conversations.json");

  // Find the conversation directory
  const summariesContent = await fs.readFile(summariesPath, "utf-8");
  const summaries = JSON.parse(summariesContent) as ConversationsFile;

  const summary = summaries.conversations.find(
    (c) => c.id === params.conversationId
  );
  if (!summary) {
    throw new Error(`Conversation ${params.conversationId} not found`);
  }

  const conversationDirPath = path.join(conversationsDir, summary.fileName);
  const conversationPath = path.join(
    conversationDirPath,
    getConversationFilePath(summary.fileName)
  );

  // Load existing conversation
  const conversationContent = await fs.readFile(conversationPath, "utf-8");
  const conversation = JSON.parse(conversationContent) as Conversation;

  // Add new message
  conversation.messages.push(params.message);

  // Write back to file
  await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
}
