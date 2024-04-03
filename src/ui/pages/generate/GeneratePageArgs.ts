import { CodingConvention } from "../../../settings/conventions/CodingConvention.js";

export type GeneratePageArgs = {
  files: { path: string; size: number | undefined }[];
  models: { name: string; value: string }[];
  codingConventions: Array<CodingConvention>;
  selectedModel: string;
  codingConvention: string | undefined;
  prompt: string;
  codegenTargets: string;
  fileVersion: "current" | "HEAD";
  includedFiles: {
    path: string;
    includeOption: "source" | "declaration";
  }[];
};
