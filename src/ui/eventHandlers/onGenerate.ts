export type OnGenerateEventArgs = {
  files: { path: string; size: number | undefined }[];
  models: { name: string; value: string }[];
  selectedModel: string;
  rules: string[];
};

export function onGenerate(args: OnGenerateEventArgs) {}
