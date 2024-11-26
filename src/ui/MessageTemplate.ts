export type MessageTemplate<TType = string, TArgs = unknown> = {
  type: TType;
} & TArgs;
