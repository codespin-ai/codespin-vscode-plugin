import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";

export type UserInput = {
  type: string;
  model: string;
  prompt: string;
  codegenTargets: string;
  codingConvention: string;
  fileVersion: string;
  includedFiles: Array<{
    path: string;
    includeOption: string;
  }>;
};

export type HistoryEntry = {
  timestamp: number;
  userInput: UserInput;
  prompt: string;
  rawPrompt: string;
};

export type FullHistoryEntry = {
  files: GeneratedSourceFile[];
} & HistoryEntry;
