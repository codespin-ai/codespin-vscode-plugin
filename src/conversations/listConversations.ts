import * as path from "path";
import * as fs from "fs/promises";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { ConversationSummary } from "./types.js";
import { ConversationsFile } from "./fileTypes.js";

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
    return data.conversations;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
