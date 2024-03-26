export type ArgsFromGeneratePanel = {
  model: string;
  prompt: string;
  codegenTargets: string;
  codingConvention: string;
  fileVersion: "current" | "HEAD";
  includedFiles: {
    path: string;
    includeOption: "source" | "declaration";
  }[];
};
