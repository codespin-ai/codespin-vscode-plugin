// listConversations.ts
import * as path from "path";
import * as fs from "fs/promises";
import { getCodeSpinDir } from "../settings/codespinDirs.js";
import { ConversationSummary } from "./types.js";
import {
  ConversationsFile,
  getConversationFileName,
  getFileNumberForPosition,
} from "./fileTypes.js";
import {
  validateConversationsFileData,
  validateConversationData,
} from "./validations.js";

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

    if (!(await validateConversationsFileData(conversationsDir, data))) {
      return [];
    }

    const typedData = data as ConversationsFile;
    const validConversations: ConversationSummary[] = [];

    for (let i = 0; i < typedData.conversations.length; i++) {
      const fileNumber = getFileNumberForPosition(typedData.lastFileNumber, i);
      const conversationPath = path.join(
        conversationsDir,
        getConversationFileName(fileNumber)
      );

      try {
        const content = await fs.readFile(conversationPath, "utf-8");
        const conversation = JSON.parse(content);

        if (await validateConversationData(conversationsDir, conversation)) {
          validConversations.push(typedData.conversations[i]);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    if (validConversations.length !== typedData.conversations.length) {
      typedData.conversations = validConversations;
      await fs.writeFile(summariesPath, JSON.stringify(typedData, null, 2));
    }

    return validConversations;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
