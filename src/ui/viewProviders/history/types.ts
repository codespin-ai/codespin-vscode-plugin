import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import { GenerateUserInput } from "../../panels/generate/types.js";

export type HistoryEntry = {
  timestamp: number;
  userInput: GenerateUserInput;
  prompt: string;
  rawPrompt: string;
  rawResponse: string;
};

export type GeneratedSourceFileWithHistory = GeneratedSourceFile & {
  history: {
    generatedFilePath: string;
    originalFilePath: string;
  };
};

export type FullHistoryEntry = {
  files: GeneratedSourceFileWithHistory[];
} & HistoryEntry;

export type UpdateHistoryArgs = {
  entries: HistoryEntry[];
};

export type UpdateHistoryEvent = {
  type: "updateHistory";
} & UpdateHistoryArgs;
