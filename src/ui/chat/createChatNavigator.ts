import { createNavigator } from "../navigation/core.js";
import type { chatRoutes } from "./routes.js";
import type { ChatPanel } from "./ChatPanel.js";

export function createChatNavigator(panel: ChatPanel) {
  return createNavigator<typeof chatRoutes>(panel);
}
