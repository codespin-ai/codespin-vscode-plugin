export type ArgsFromGeneratePanel = {
  model: string;
  prompt: string;
  codegenTargets: string;
  codingConvention: string | undefined;
  fileVersion: "current" | "HEAD";
  files: {
    path: string;
    includeOption: "source" | "declaration";
    size: number;
  }[];
};
