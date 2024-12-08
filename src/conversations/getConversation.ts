import * as path from "path";
import * as fs from "fs/promises";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { Conversation, ConversationsFile } from "./types.js";
import { validateConversation } from "./validations.js";
import { clearAllData } from "./clearAllData.js";

export async function getConversation(
  params: {
    id: string;
  },
  workspaceRoot: string
): Promise<Conversation | undefined> {
  const conversationsDir = path.join(
    getCodeSpinDir(workspaceRoot),
    "conversations"
  );
  const summariesPath = path.join(conversationsDir, "conversations.json");

  try {
    const summariesContent = await fs.readFile(summariesPath, "utf-8");
    const summaries = JSON.parse(summariesContent) as ConversationsFile;

    const summary = summaries.conversations.find((c) => c.id === params.id);
    if (!summary) {
      return undefined;
    }

    const conversationDirPath = path.join(conversationsDir, summary.id);
    const conversationPath = path.join(
      conversationDirPath,
      "conversation.json"
    );

    try {
      const conversationContent = await fs.readFile(conversationPath, "utf-8");
      const conversation = JSON.parse(conversationContent);

      if (!validateConversation(conversation)) {
        await clearAllData(conversationsDir);
        return undefined;
      }

      return conversation as Conversation;
    } catch (error) {
      // If file doesn't exist, data is corrupted
      await clearAllData(conversationsDir);
      return undefined;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
