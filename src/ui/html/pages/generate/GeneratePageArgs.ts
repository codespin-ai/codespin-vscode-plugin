import { CodingConvention } from "../../../../settings/conventions/CodingConvention.js";
import {
  FileVersions,
  IncludeOptions,
} from "../../../panels/generate/eventArgs.js";

export type GeneratePageArgs = {
  files: {
    path: string;
    size: number;
    includeOption: IncludeOptions;
  }[];
  models: { [key: string]: string };
  codingConventions: Array<CodingConvention>;
  selectedModel: string;
  codingConvention: string | undefined;
  prompt: string;
  codegenTargets: string;
  fileVersion: FileVersions;
};
