import { isInitialized } from "../../../settings/isInitialized.js";
import { listConversations } from "../../../conversations/listConversations.js";
import { ConversationsViewProvider } from "../ConversationsViewProvider.js";
import { createConversationsNavigator } from "../createConversationsNavigator.js";

export async function handleWebviewReady(
  provider: ConversationsViewProvider,
  workspaceRoot: string
): Promise<void> {
  const navigate = createConversationsNavigator(provider);
  const initialized = await isInitialized(workspaceRoot);

  if (initialized) {
    const entries = await listConversations(workspaceRoot);
    await navigate("/conversations", { entries });
  } else {
    await navigate("/initialize");
  }
}
