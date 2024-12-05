// saveConversation.ts
import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import {
  ConversationsFile,
  getConversationFileName,
  getNextFileNumber,
} from "./fileTypes.js";
import { Message, ConversationSummary, UserMessage } from "./types.js";

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

export async function saveConversation(params: {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
  messages: Message[];
  workspaceRoot: string;
}): Promise<void> {
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
      lastFileNumber: 1,
      conversations: [],
    };
  }

  const title = params.title || getInitialTitle(params.messages);
  const fileNumber = getNextFileNumber(conversationsFile.lastFileNumber);
  const fileName = getConversationFileName(fileNumber);

  const conversationPath = path.join(conversationsDir, fileName);
  await fs.unlink(conversationPath).catch(() => {}); // Delete if exists

  const summary: ConversationSummary & { fileName: string } = {
    id: params.id,
    title,
    timestamp: params.timestamp,
    model: params.model,
    codingConvention: params.codingConvention,
    fileName,
  };

  const existingIndex = conversationsFile.conversations.findIndex(
    (c) => c.id === params.id
  );
  if (existingIndex !== -1) {
    conversationsFile.conversations[existingIndex] = summary;
  } else {
    conversationsFile.conversations.unshift(summary);
  }

  conversationsFile.lastFileNumber = fileNumber;
  await fs.writeFile(summariesPath, JSON.stringify(conversationsFile, null, 2));

  const conversation = {
    ...params,
    title,
  };
  await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
}
