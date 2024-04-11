export type NavigateArgs = {
  url: string;
  state: unknown;
};

export type NavigateEvent = {
  type: "navigate";
} & NavigateArgs;

export type CancelEvent = {
  type: "cancel";
};
