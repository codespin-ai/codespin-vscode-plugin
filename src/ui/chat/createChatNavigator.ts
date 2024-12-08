import { createNavigator } from "../navigation/core.js";
import { ChatRoutes } from "./routes.js";
import { ChatPanel } from "./ChatPanel.js";

export function createChatNavigator(panel: ChatPanel) {
  return createNavigator<ChatRoutes>({
    routes: {} as ChatRoutes,
    container: panel,
  });
}
