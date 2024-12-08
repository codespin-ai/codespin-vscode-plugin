import type { ConversationSummary } from "../../conversations/types.js";

export type ConversationRoutes = {
  "/conversations": {
    entries: ConversationSummary[];
  };
  "/initialize": undefined;
};
