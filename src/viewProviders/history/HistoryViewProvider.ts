import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ViewProvider } from "../../ui/ViewProvider.js";
import { HistoryEntry, UserInput } from "./types.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { HistoryPageArgs } from "../../ui/pages/history/HistoryPageArgs.js";
import { isInitialized } from "../../codespin/isInitialized.js";
import { EventTemplate } from "../../EventTemplate.js";
import { initialize } from "../../codespin/initialize.js";

export class HistoryViewProvider extends ViewProvider {
  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async init() {
    await this.onInitialize();
    await this.onWebviewReady();
    const workspaceRoot = getWorkspaceRoot(this.context);

    const initialized = await isInitialized(workspaceRoot);

    if (initialized) {
      const historyPageArgs: HistoryPageArgs = {
        entries: initialized ? await getHistory(this.context) : [],
      };

      this.navigateTo("/history", historyPageArgs);
    } else {
      this.navigateTo("/initialize");
    }
  }

  async onMessage(data: EventTemplate<unknown>) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    switch (data.type) {
      case "initialize":
        await initialize(false, workspaceRoot);

        const historyPageArgs: HistoryPageArgs = {
          entries: await getHistory(this.context),
        };

        this.navigateTo("/history", historyPageArgs);

        break;
    }
  }
}

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
async function getHistory(
  context: vscode.ExtensionContext
): Promise<HistoryEntry[]> {
  const workspaceRoot = getWorkspaceRoot(context);
  const projectConfigDir = path.join(workspaceRoot, ".codespin");
  const directoryPath = path.join(projectConfigDir, "history");
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
