import { FullHistoryEntry } from "../../../viewProviders/history/types.js";

export type HistoryEntryPageArgs = {
  entry: FullHistoryEntry;
  formattedFiles: {
    [key: string]: { original: string | undefined; generated: string };
  };
};
