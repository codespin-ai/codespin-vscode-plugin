export type FileVersions = "current" | "HEAD";
export type IncludeOptions = "source" | "declaration";

export type IncludeFilesEventArgs = {
  files: {
    path: string;
    size: number;
  }[];
};

export type PromptCreatedEventArgs = {
  prompt: string;
};

export type ResponseStreamEventArgs = {
  data: string;
};
