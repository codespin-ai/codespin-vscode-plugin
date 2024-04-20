import { GenerateUserInput } from "../generate/types.js";

export type GenerateCommitMessageArgs = {
  model: string;
};

export type GenerateCommitMessageEvent = {
  type: "generateCommitMessage";
  prompt: string;
} & GenerateCommitMessageArgs;

export type GeneratedCommitMessageArgs = {
  message: string;
};

export type GeneratedCommitMessageEvent = {
  type: "generatedCommitMessage";
} & GeneratedCommitMessageArgs;

export type CommitEvent = {
  type: "commit";
  message: string;
};

export type CommittedEvent = {
  type: "committed";
};

export type RegenerateEvent = {
  type: "regenerate";
  args: GenerateUserInput;
};
