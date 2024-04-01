import { FullHistoryEntry } from "../../../viewProviders/history/types.js";

export type HistoryEntryPageArgs = {
  entry: FullHistoryEntry | null;
  formattedFiles: {
    [key: string]: { original: string; generated: string };
  } | null;
};
