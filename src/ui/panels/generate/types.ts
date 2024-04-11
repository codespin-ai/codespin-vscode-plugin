import { CodingConvention } from "../../../settings/conventions/CodingConvention.js";

export type FileVersions = "current" | "HEAD";
export type IncludeOptions = "source" | "declaration";

export type ModelChange = {
  model: string;
};

export type IncludeFilesArgs = {
  files: {
    path: string;
    size: number;
  }[];
};

export type IncludeFilesEvent = {
  type: "includeFiles";
} & IncludeFilesArgs;

export type PromptCreatedArgs = {
  prompt: string;
};

export type PromptCreatedEvent = {
  type: "promptCreated";
} & PromptCreatedArgs;

export type ResponseStreamArgs = {
  data: string;
};

export type ResponseStreamEvent = {
  type: "responseStream";
} & ResponseStreamArgs;

export type AddDepsArgs = {
  file: string;
  model: string;
};

export type AddDepsEvent = {
  type: "addDeps";
} & AddDepsArgs;

export type ModelChangeEvent = {
  type: "modelChange";
} & ModelChange;

export type GenerateEvent = {
  type: "generate";
} & ArgsFromGeneratePanel;

export type ArgsFromGeneratePanel = {
  model: string;
  prompt: string;
  codegenTargets: string;
  codingConvention: string | undefined;
  fileVersion: FileVersions;
  includedFiles: {
    path: string;
    includeOption: IncludeOptions;
  }[];
};

export type RegenerateArgs = {
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
