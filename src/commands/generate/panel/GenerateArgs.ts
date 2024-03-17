type GenerateArgs = {
  files: { path: string; size: number | undefined }[];
  models: { name: string; value: string }[];
  rules: string[];
};
