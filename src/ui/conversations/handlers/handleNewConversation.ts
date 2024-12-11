import { listConversations } from "../../../conversations/listConversations.js";
import { ConversationsViewProvider } from "../ConversationsViewProvider.js";
import { UpdateConversationsEvent } from "../types.js";

export async function handleNewConversation(
  provider: ConversationsViewProvider,
  workspaceRoot: string
): Promise<void> {
  const updateConversationsEvent: UpdateConversationsEvent = {
    type: "updateConversations",
    entries: await listConversations(workspaceRoot),
  };

  const webview = provider.getWebview();
  if (webview) {
    webview.postMessage(updateConversationsEvent);
  }
}
