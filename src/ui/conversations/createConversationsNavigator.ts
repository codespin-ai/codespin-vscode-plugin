import { createNavigator } from "../navigation/core.js";
import type { ConversationRoutes } from "./routes.js";
import type { ConversationsViewProvider } from "./ConversationsViewProvider.js";

export function createConversationsNavigator(
  provider: ConversationsViewProvider
) {
  return createNavigator<ConversationRoutes>({
    routes: {} as ConversationRoutes,
    container: provider,
  });
}
