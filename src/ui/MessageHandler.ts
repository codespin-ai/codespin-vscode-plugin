import { EventTemplate } from "./EventTemplate.js";

export type MessageHandler = (message: EventTemplate<string, unknown>) => void;
