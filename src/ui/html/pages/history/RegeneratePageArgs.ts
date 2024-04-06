import { CodingConvention } from "../../../../settings/conventions/CodingConvention.js";

export type RegeneratePageArgs = {
  model: string;
  codegenTargets: string;
  prompt: string;
  codingConvention: CodingConvention | undefined;
  fileVersion: "current" | "HEAD";
  includedFiles: {
    path: string;
    includeOption: "source" | "declaration";
  }[];
};
