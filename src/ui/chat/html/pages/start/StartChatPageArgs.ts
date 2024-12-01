import { ModelDescription } from "codespin/dist/settings/CodeSpinConfig.js";
import { CodingConvention } from "../../../../../settings/conventions/CodingConvention.js";

export type StartChatPageArgs = {
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
