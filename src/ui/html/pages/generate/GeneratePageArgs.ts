import { ModelDescription } from "codespin/dist/settings/CodeSpinConfig.js";
import { CodingConvention } from "../../../../settings/conventions/CodingConvention.js";
import { FileVersions } from "../../../panels/generate/types.js";

export type GeneratePageArgs = {
  models: ModelDescription[],
  codingConventions: Array<CodingConvention>;
  selectedModel: string;
  codingConvention: string | undefined;
  prompt: string;
  includedFiles: {
    path: string;
    size: number;
  }[];
  uiProps?: {
    promptTextAreaHeight?: number;
    promptTextAreaWidth?: number;
  };
};
