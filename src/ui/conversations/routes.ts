import { ConversationsPage } from "./html/pages/conversations/conversations-page.js";
import { InitializePage } from "./html/pages/initialize/initialize-page.js";

export const conversationRoutes = {
  "/conversations": ConversationsPage,
  "/initialize": InitializePage,
} as const;

export type ConversationRoutes = typeof conversationRoutes;
