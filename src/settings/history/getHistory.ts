import { promises as fs } from "fs";
import { HistoryEntry } from "../../viewProviders/history/types.js";
import { getHistoryDir } from "../codespinDirs.js";
import { getHistoryEntry } from "./getHistoryEntry.js";

// Update getHistory to async function
export async function getHistory(
  workspaceRoot: string
): Promise<HistoryEntry[]> {
  const directoryPath = await getHistoryDir(workspaceRoot);
  const dirs = await fs.readdir(directoryPath, { withFileTypes: true });
  const historyDirs = dirs.filter((dir) => dir.isDirectory());

  const historyEntriesPromises = historyDirs.map((dir) =>
    getHistoryEntry(dir.name, workspaceRoot)
  );

  const historyEntries = await Promise.all(historyEntriesPromises);

  return historyEntries.filter(
    (entry): entry is HistoryEntry => entry !== null
  );
}
