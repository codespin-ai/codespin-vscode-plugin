import { Chat } from "./html/pages/chat/chat.js";
import { StartChat } from "./html/pages/start/start-chat.js";
import { EditConfig } from "./html/pages/provider/edit-config.js";

export const chatRoutes = {
  "/chat": Chat,
  "/start": StartChat,
  "/provider/config/edit": EditConfig,
} as const;

export type ChatRoutes = typeof chatRoutes;
