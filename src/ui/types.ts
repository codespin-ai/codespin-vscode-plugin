export type MessageTemplate<TType = string, TArgs = unknown> = {
  type: TType;
} & TArgs;

export type BrowserEvent = {
  data: MessageTemplate;
};
