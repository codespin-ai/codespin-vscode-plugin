import * as path from "path";
import * as fs from "fs/promises";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { Conversation, ConversationSummary } from "./types.js";
import {
  ConversationsFile,
  getConversationFileName,
  getFileNumberForPosition,
} from "./fileTypes.js";

export async function getConversation(params: {
  id: string;
  workspaceRoot: string;
}): Promise<Conversation | null> {
  const conversationsDir = path.join(
    getCodeSpinDir(params.workspaceRoot),
    "conversations"
  );
  const summariesPath = path.join(conversationsDir, "conversations.json");

  try {
    const summariesContent = await fs.readFile(summariesPath, "utf-8");
    const summaries = JSON.parse(summariesContent) as ConversationsFile;

    const conversationIndex = summaries.conversations.findIndex(
      (c: ConversationSummary) => c.id === params.id
    );
    if (conversationIndex === -1) {
      return null;
    }

    const fileNumber = getFileNumberForPosition(
      summaries.lastFileNumber,
      conversationIndex
    );
    const conversationPath = path.join(
      conversationsDir,
      getConversationFileName(fileNumber)
    );

    const conversationContent = await fs.readFile(conversationPath, "utf-8");
    if (!conversationContent) {
      summaries.conversations.splice(conversationIndex, 1);
      await fs.writeFile(summariesPath, JSON.stringify(summaries, null, 2));
      return null;
    }

    return JSON.parse(conversationContent) as Conversation;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
