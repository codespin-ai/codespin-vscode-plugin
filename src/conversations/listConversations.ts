import * as path from "path";
import * as fs from "fs/promises";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { ConversationSummary } from "./types.js";
import { ConversationsFile } from "./fileTypes.js";
import { clearAllData } from "./clearAllData.js";

function validateConversationsStructure(
  data: unknown
): data is ConversationsFile {
  if (!data || typeof data !== "object") {
    return false;
  }

  const file = data as ConversationsFile;

  if (
    typeof file.lastFileNumber !== "number" ||
    file.lastFileNumber < 1 ||
    file.lastFileNumber > 200 ||
    !Array.isArray(file.conversations)
  ) {
    return false;
  }

  // Check structure of each conversation entry
  if (
    !file.conversations.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        typeof c.timestamp === "number" &&
        typeof c.model === "string" &&
        (c.codingConvention === null ||
          typeof c.codingConvention === "string") &&
        Array.isArray(c.includedFiles) &&
        c.includedFiles.every((f) => typeof f.path === "string") &&
        typeof c.fileName === "string" &&
        c.fileName.startsWith("conversation_") &&
        c.fileName.endsWith(".json")
    )
  ) {
    return false;
  }

  // Check for duplicate IDs
  const ids = new Set(file.conversations.map((c) => c.id));
  if (ids.size !== file.conversations.length) {
    return false;
  }

  return true;
}

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

    // Return summaries without the fileName field
    return data.conversations.map(({ fileName, ...summary }) => summary);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
