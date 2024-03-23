export type GenerateArgs = {
  model: string;
  prompt: string;
  codegenTargets: string;
  codingConvention: string;
  fileVersion: string;
  includedFiles: {
    path: string;
    includeOption: "source" | "declaration";
  }[];
};
