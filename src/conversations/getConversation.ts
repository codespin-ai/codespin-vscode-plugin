import * as path from "path";
import * as fs from "fs/promises";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { Conversation } from "./types.js";
import { getConversationFileName } from "./fileTypes.js";

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
    const summaries = JSON.parse(summariesContent);

    const conversation = summaries.conversations.find(
      (c: any) => c.id === params.id
    );
    if (!conversation) {
      return null;
    }

    const conversationPath = path.join(
      conversationsDir,
      getConversationFileName(conversation.fileNumber)
    );
    const conversationContent = await fs.readFile(conversationPath, "utf-8");

    return JSON.parse(conversationContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
