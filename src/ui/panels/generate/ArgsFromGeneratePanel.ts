import { FileVersions, IncludeOptions } from "./eventArgs.js";

export type ArgsFromGeneratePanel = {
  model: string;
  prompt: string;
  codegenTargets: string;
  codingConvention: string | undefined;
  fileVersion: FileVersions;
  includedFiles: {
    path: string;
    includeOption: IncludeOptions;
  }[];
};
