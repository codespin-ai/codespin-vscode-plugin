// addMessage.ts
import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { Message, Conversation, ConversationsFile } from "./types.js";

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

  const conversationDirPath = path.join(conversationsDir, summary.id);
  const conversationPath = path.join(conversationDirPath, "conversation.json");

  // Load existing conversation
  const conversationContent = await fs.readFile(conversationPath, "utf-8");
  const conversation = JSON.parse(conversationContent) as Conversation;

  // Add new message
  conversation.messages.push(params.message);

  // Write back to file
  await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
}
