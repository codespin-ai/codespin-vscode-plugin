import type { Conversation } from "../../conversations/types.js";
import type { EditConfigPageProps } from "./html/pages/provider/EditConfig.js";
import { StartChatPageProps } from "./html/pages/start/StartChat.js";

export type ChatRoutes = {
  "/chat": {
    conversation: Conversation;
    isNew: boolean;
  };
  "/start": StartChatPageProps;
  "/provider/config/edit": EditConfigPageProps;
};
