import { Chat } from "./html/pages/chat/Chat.js";
import { StartChat } from "./html/pages/start/StartChat.js";
import { EditConfig } from "./html/pages/provider/EditConfig.js";

export const chatRoutes = {
  "/chat": Chat,
  "/start": StartChat,
  "/provider/config/edit": EditConfig,
} as const;

export type ChatRoutes = typeof chatRoutes;
