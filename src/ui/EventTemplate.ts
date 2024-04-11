export type EventTemplate<EventName = string, TArgs = unknown> = {
  type: EventName;
} & TArgs;
