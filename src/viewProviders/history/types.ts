import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import { CodingConvention } from "../../settings/conventions/CodingConvention.js";

export type UserInput = {
  type: string;
  model: string;
  prompt: string;
  codegenTargets: string;
  codingConvention: CodingConvention | undefined;
  fileVersion: "current" | "HEAD";
  includedFiles: Array<{
    path: string;
    includeOption: "source" | "declaration";
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
