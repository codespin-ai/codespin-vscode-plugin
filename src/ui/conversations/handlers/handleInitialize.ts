import { initialize } from "../../../settings/initialize.js";
import { listConversations } from "../../../conversations/listConversations.js";
import { ConversationsViewProvider } from "../ConversationsViewProvider.js";
import { createConversationsNavigator } from "../createConversationsNavigator.js";

export async function handleInitialize(
  provider: ConversationsViewProvider,
  workspaceRoot: string
): Promise<void> {
  await initialize(false, workspaceRoot);
  const entries = await listConversations(workspaceRoot);

  const navigate = createConversationsNavigator(provider);
  await navigate("/conversations", { entries });
}
