import { EventTemplate } from "./EventTemplate.js";

export type MessageHandler = (message: EventTemplate<unknown>) => void;
