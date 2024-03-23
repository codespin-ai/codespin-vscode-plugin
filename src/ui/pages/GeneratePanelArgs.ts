export type GeneratePanelArgs = {
  files: { path: string; size: number | undefined }[];
  models: { name: string; value: string }[];
  selectedModel: string;
  rules: string[];
};
