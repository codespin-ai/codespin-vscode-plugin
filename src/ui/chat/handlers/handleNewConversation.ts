import { createConversation } from "../../../conversations/createConversation.js";
import { getConversation } from "../../../conversations/getConversation.js";
import {
  UserMessage,
  UserTextContent,
  UserFileContent,
} from "../../../conversations/types.js";
import { ChatPanel } from "../ChatPanel.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { NewConversationEvent } from "../types.js";

export async function handleNewConversation(
  chatPanel: ChatPanel,
  message: NewConversationEvent,
  workspaceRoot: string
): Promise<void> {
  // Construct initial user message
  const userContent: (UserTextContent | UserFileContent)[] = [
    {
      type: "text",
      text: message.prompt,
    },
    {
      type: "files" as const,
      includedFiles: message.includedFiles.map((file) => ({
        path: file.path,
      })),
    },
  ];

  const userMessage: UserMessage = {
    role: "user",
    content: userContent,
  };

  // Create empty conversation with just the user message
  const conversationId = await createConversation(
    {
      title: message.prompt.slice(0, 100) ?? "Untitled",
      timestamp: Date.now(),
      model: message.model,
      codingConvention: message.codingConvention || undefined,
      initialMessage: userMessage,
    },
    workspaceRoot
  );

  const conversation = await getConversation(
    { id: conversationId },
    workspaceRoot
  );
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }

  const navigate = createChatNavigator(chatPanel);
  await navigate("/chat", { conversation, isNew: true });
}
