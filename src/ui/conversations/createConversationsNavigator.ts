import { createNavigator } from "../navigation/createNavigator.js";
import type { conversationRoutes } from "./routes.js";
import type { ConversationsViewProvider } from "./ConversationsViewProvider.js";

export function createConversationsNavigator(
  provider: ConversationsViewProvider
) {
  return createNavigator<typeof conversationRoutes>(provider);
}
