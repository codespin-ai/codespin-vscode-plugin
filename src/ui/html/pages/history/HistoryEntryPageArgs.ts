import { FullHistoryEntry } from "../../../viewProviders/history/types.js";

export type HistoryEntryPageFile = {
  original: string | undefined;
  generated: string;
  diffHtml: string;
};

export type HistoryEntryPageArgs = {
  entry: FullHistoryEntry;
  files: {
    [key: string]: HistoryEntryPageFile;
  };
};
