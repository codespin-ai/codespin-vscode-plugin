export type IncludeFilesEventArgs = {
  files: string[];
};

export type PromptCreatedEventArgs = {
  prompt: string;
};

export type ResponseStreamEventArgs = {
  data: string;
};
