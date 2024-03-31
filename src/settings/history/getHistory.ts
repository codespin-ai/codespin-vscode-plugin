import { HistoryEntry, UserInput } from "../../viewProviders/history/types.js";
import * as vscode from "vscode";
import * as path from "path";
import { promises as fs } from "fs";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { getHistoryDir } from "../codespinDirs.js";

// Functional style utility functions
async function readJsonFile<T>(filePath: string): Promise<T> {
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

// Convert readTextFile to async function
async function readTextFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

// Update getHistoryEntry to async function
async function getHistoryEntry(dirPath: string): Promise<HistoryEntry | null> {
  const timestamp = parseInt(path.basename(dirPath), 10);
  if (isNaN(timestamp)) {
    return null;
  }

  const userInputPath = path.join(dirPath, "user-input.json");
  const promptPath = path.join(dirPath, "prompt.txt");

  try {
    const [userInputExists, promptExists] = await Promise.all([
      fs
        .access(userInputPath)
        .then(() => true)
        .catch(() => false),
      fs
        .access(promptPath)
        .then(() => true)
        .catch(() => false),
    ]);

    if (userInputExists && promptExists) {
      const userInput = await readJsonFile<UserInput>(userInputPath);
      const prompt = await readTextFile(promptPath);
      return { timestamp, userInput, prompt };
    }
  } catch (error) {
    console.error("Error reading history entry:", error);
  }

  return null;
}

// Update getHistory to async function
export async function getHistory(
  context: vscode.ExtensionContext
): Promise<HistoryEntry[]> {
  const workspaceRoot = getWorkspaceRoot(context);
  const directoryPath = await getHistoryDir(workspaceRoot);
  const dirs = await fs.readdir(directoryPath, { withFileTypes: true });
  const historyDirs = dirs.filter((dir) => dir.isDirectory());

  const historyEntriesPromises = historyDirs.map((dir) =>
    getHistoryEntry(path.join(directoryPath, dir.name))
  );

  const historyEntries = await Promise.all(historyEntriesPromises);
  return historyEntries.filter(
    (entry): entry is HistoryEntry => entry !== null
  );
}
