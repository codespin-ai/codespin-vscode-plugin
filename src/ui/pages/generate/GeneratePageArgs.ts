import { CodingConvention } from "../../../settings/CodingConvention.js";

export type GeneratePageArgs = {
  files: { path: string; size: number | undefined }[];
  models: { name: string; value: string }[];
  selectedModel: string;
  conventions: Array<CodingConvention>;
};
