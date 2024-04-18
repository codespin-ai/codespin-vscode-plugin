import { promises as fs } from "fs";
import * as path from "path";

import { getHistoryDir } from "../codespinDirs.js";
import { readGeneratedFiles } from "./readGeneratedFiles.js";
import {
  FullHistoryEntry,
  HistoryEntry,
} from "../../ui/viewProviders/history/types.js";
import { GenerationUserInput } from "../../ui/panels/generate/types.js";

// Functional style utility functions
async function readJsonFile<T>(filePath: string): Promise<T> {
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

// Convert readTextFile to also check if the file exists before reading
async function readTextFile(filePath: string): Promise<string> {
  try {
    await fs.access(filePath);
    return fs.readFile(filePath, "utf8");
  } catch {
    // If the file does not exist, return an empty string
    return "";
  }
}

// Update getHistoryEntry to async function
export async function getHistoryEntry(
  entryDirName: string,
  workspaceRoot: string
): Promise<HistoryEntry | null> {
  try {
    const historyDir = await getHistoryDir(workspaceRoot);

    const entryDirPath = path.join(historyDir, entryDirName);

    const userInputPath = path.join(entryDirPath, "user-input.json");
    const promptPath = path.join(entryDirPath, "prompt.txt");
    const rawPromptPath = path.join(entryDirPath, "raw-prompt.txt");
    const rawResponsePath = path.join(entryDirPath, "raw-response.txt");

    const timestamp = parseInt(path.basename(entryDirName), 10);

    if (isNaN(timestamp)) {
      return null;
    }

    const userInput = await readJsonFile<GenerationUserInput>(userInputPath);
    const prompt = await readTextFile(promptPath);
    const rawPrompt = await readTextFile(rawPromptPath);
    const rawResponse = await readTextFile(rawResponsePath);

    return { timestamp, userInput, prompt, rawPrompt, rawResponse };
  } catch (ex: any) {
    console.error(
      `Could not process ${entryDirName}: ${ex.message || "unknown error"}`
    );
    return null;
  }
}

export async function getFullHistoryEntry(
  entryDirName: string,
  workspaceRoot: string
): Promise<FullHistoryEntry | null> {
  // First, we attempt to get the basic history entry data
  const historyEntry = await getHistoryEntry(entryDirName, workspaceRoot);
  if (!historyEntry) {
    // If we cannot get the basic history entry, return null
    return null;
  }

  // Then, we read the generated source files associated with this history entry
  const files = await readGeneratedFiles(entryDirName, workspaceRoot);

  // Construct and return the full history entry
  const fullHistoryEntry: FullHistoryEntry = {
    ...historyEntry,
    files, 
  };

  return fullHistoryEntry;
}
