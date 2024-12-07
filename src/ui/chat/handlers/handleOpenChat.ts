import { createConversation } from "../../../conversations/createConversation.js";
import { getConversation } from "../../../conversations/getConversation.js";
import {
  UserMessage,
  UserTextContent,
  UserFileContent,
} from "../../../conversations/types.js";
import { navigateTo } from "../../navigateTo.js";
import { ChatPanel } from "../ChatPanel.js";
import { OpenChatEvent } from "../types.js";

export async function handleOpenChat(
  chatPanel: ChatPanel,
  message: OpenChatEvent,
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
      codingConvention: message.codingConvention || null,
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

  await navigateTo(chatPanel, "/chat", { conversation });
}
