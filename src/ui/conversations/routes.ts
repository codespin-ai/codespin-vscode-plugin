import { Conversations } from "./html/pages/conversations/Conversations.js";
import { Initialize } from "./html/pages/initialize/Initialize.js";

export const conversationRoutes = {
  "/conversations": Conversations,
  "/initialize": Initialize,
} as const;

export type ConversationRoutes = typeof conversationRoutes;
