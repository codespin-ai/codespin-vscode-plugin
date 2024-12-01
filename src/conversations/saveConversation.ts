import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import {
  ConversationsFile,
  getConversationFileName,
  getNextFileNumber,
} from "./fileTypes.js";
import { Message } from "./types.js";

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
  includedFiles: { path: string }[];
  messages: Message[];
  workspaceRoot: string;
}): Promise<void> {
  const conversationsDir = path.join(
    getCodeSpinDir(params.workspaceRoot),
    "conversations"
  );
  const summariesPath = path.join(conversationsDir, "conversations.json");

  // Read or initialize the conversations file
  let conversationsFile: ConversationsFile;
  try {
    const content = await fs.readFile(summariesPath, "utf-8");
    conversationsFile = JSON.parse(content);
  } catch {
    conversationsFile = {
      lastFileNumber: 0,
      conversations: [],
    };
  }

  // Generate title from first message if not provided
  const title = params.title || getInitialTitle(params.messages);

  // Determine file number and update lastFileNumber
  const fileNumber = getNextFileNumber(conversationsFile.lastFileNumber);
  conversationsFile.lastFileNumber = fileNumber;

  // Create the conversation summary
  const summary = {
    id: params.id,
    title,
    timestamp: params.timestamp,
    model: params.model,
    codingConvention: params.codingConvention,
    includedFiles: params.includedFiles,
    fileNumber,
  };

  // Update conversations list
  const existingIndex = conversationsFile.conversations.findIndex(
    (c) => c.id === params.id
  );
  if (existingIndex !== -1) {
    conversationsFile.conversations[existingIndex] = summary;
  } else {
    conversationsFile.conversations.unshift(summary);
  }

  // Save the conversation detail file
  const conversationPath = path.join(
    conversationsDir,
    getConversationFileName(fileNumber)
  );
  await fs.writeFile(
    conversationPath,
    JSON.stringify(
      {
        ...summary,
        messages: params.messages,
      },
      null,
      2
    )
  );

  // Save the summaries file
  await fs.writeFile(summariesPath, JSON.stringify(conversationsFile, null, 2));
}
