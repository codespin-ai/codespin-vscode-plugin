import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import {
  ConversationsFile,
  getConversationFileName,
  getNextFileNumber,
} from "./fileTypes.js";
import { Message, ConversationSummary } from "./types.js";

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

// saveConversation.ts
// Key changes: Remove fileNumber from summary, calculate file number only when needed
export async function saveConversation(params: {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
  includedFiles: { path: string }[];
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
      lastFileNumber: 0,
      conversations: [],
    };
  }

  const title = params.title || getInitialTitle(params.messages);
  const fileNumber = getNextFileNumber(conversationsFile.lastFileNumber);

  const conversationPath = path.join(
    conversationsDir,
    getConversationFileName(fileNumber)
  );
  await fs.writeFile(conversationPath, "");

  const summary: ConversationSummary = {
    id: params.id,
    title,
    timestamp: params.timestamp,
    model: params.model,
    codingConvention: params.codingConvention,
    includedFiles: params.includedFiles,
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
    ...summary,
    messages: params.messages,
  };
  await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
}
