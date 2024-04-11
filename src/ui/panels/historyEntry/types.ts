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
