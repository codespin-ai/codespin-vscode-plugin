import * as path from "path";
import * as fs from "fs/promises";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { ConversationSummary } from "./types.js";
import {
  ConversationsFile,
  getConversationFileName,
  getFileNumberForPosition,
} from "./fileTypes.js";

export async function listConversations(params: {
  workspaceRoot: string;
}): Promise<ConversationSummary[]> {
  const conversationsDir = path.join(
    getCodeSpinDir(params.workspaceRoot),
    "conversations"
  );
  const summariesPath = path.join(conversationsDir, "conversations.json");

  try {
    const content = await fs.readFile(summariesPath, "utf-8");
    const data = JSON.parse(content) as ConversationsFile;

    const validConversations: ConversationSummary[] = [];

    for (let i = 0; i < data.conversations.length; i++) {
      const fileNumber = getFileNumberForPosition(data.lastFileNumber, i);
      const conversationPath = path.join(
        conversationsDir,
        getConversationFileName(fileNumber)
      );

      try {
        const content = await fs.readFile(conversationPath, "utf-8");
        if (content) {
          validConversations.push(data.conversations[i]);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    if (validConversations.length !== data.conversations.length) {
      data.conversations = validConversations;
      await fs.writeFile(summariesPath, JSON.stringify(data, null, 2));
    }

    return validConversations;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
