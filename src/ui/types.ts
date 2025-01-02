export type MessageTemplate<TType = string, TArgs = unknown> = {
  type: TType;
} & TArgs;

export type BrowserEvent = {
  data: MessageTemplate;
};

export type NavigateArgs = {
  url: string;
};

export type NavigateEvent = {
  type: "navigate";
} & NavigateArgs;
