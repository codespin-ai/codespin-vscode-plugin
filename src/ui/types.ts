export type BrowserEvent = {
  data: MessageTemplate;
};

export type MessageTemplate<TType = string, TArgs = unknown> = {
  type: TType;
} & TArgs;

export type MessageHandler = (
  message: MessageTemplate<string, unknown>
) => void;

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
