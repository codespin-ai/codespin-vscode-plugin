// listConversations.ts
import * as fs from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { clearAllData } from "./clearAllData.js";
import { ConversationSummary } from "./types.js";
import { validateConversationsStructure } from "./validations.js";

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
    const data = JSON.parse(content);

    if (!validateConversationsStructure(data)) {
      await clearAllData(conversationsDir);
      return [];
    }

    return data.conversations;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
