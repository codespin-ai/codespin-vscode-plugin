import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import { GenerationUserInput } from "../../panels/generate/types.js";

export type HistoryEntry = {
  timestamp: number;
  userInput: GenerationUserInput;
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
