import { MessageTemplate } from "./MessageTemplate.js";

export type MessageHandler = (message: MessageTemplate<string, unknown>) => void;
