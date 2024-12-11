import { BrokerType, createMessageBroker } from "../../ipc/messageBroker.js";
import { ChatPanel } from "./ChatPanel.js";
import { handleAddDeps } from "./handlers/handleAddDeps.js";
import { handleCancel } from "./handlers/handleCancel.js";
import { handleCopyToClipboard } from "./handlers/handleCopyToClipboard.js";
import { handleEditAnthropicConfig } from "./handlers/handleEditAnthropicConfig.js";
import { handleEditOpenAIConfig } from "./handlers/handleEditOpenAIConfig.js";
import { handleGenerate } from "./handlers/handleGenerate.js";
import { handleGetMarkdown } from "./handlers/handleGetMarkdown.js";
import { handleMarkdownToHtml } from "./handlers/handleMarkdownToHtml.js";
import { handleModelChange } from "./handlers/handleModelChange.js";
import { handleNewConversation } from "./handlers/handleNewConversation.js";
import { handleOpenChat } from "./handlers/handleOpenChat.js";
import { handleOpenFile } from "./handlers/handleOpenFile.js";
import { handleSourceCodeToHtml } from "./handlers/handleSourceCodeToHtml.js";
import { handleNewChat } from "./handlers/handleStartChat.js";
import {
  AddDepsEvent,
  CopyToClipboardEvent,
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
  GenerateEvent,
  GetMarkdownEvent,
  MarkdownToHtmlEvent,
  ModelChangeEvent,
  NewConversationEvent,
  OpenChatEvent,
  OpenFileEvent,
  SourceCodeToHtmlEvent,
  StartChatEvent,
} from "./types.js";

export function getMessageBroker(chatPanel: ChatPanel, workspaceRoot: string) {
  return createMessageBroker()
    .attachHandler("addDeps", (message: AddDepsEvent) =>
      handleAddDeps(chatPanel, message, workspaceRoot)
    )
    .attachHandler("copyToClipboard", (message: CopyToClipboardEvent) =>
      handleCopyToClipboard(message, workspaceRoot)
    )
    .attachHandler("generate", (message: GenerateEvent) =>
      handleGenerate(chatPanel, message, workspaceRoot)
    )
    .attachHandler("newConversation", (message: NewConversationEvent) =>
      handleNewConversation(chatPanel, message, workspaceRoot)
    )
    .attachHandler("openChat", (message: OpenChatEvent) =>
      handleOpenChat(chatPanel, message, workspaceRoot)
    )
    .attachHandler("startChat", (message: StartChatEvent) =>
      handleNewChat(chatPanel, message)
    )
    .attachHandler("editAnthropicConfig", (message: EditAnthropicConfigEvent) =>
      handleEditAnthropicConfig(chatPanel, message, workspaceRoot)
    )
    .attachHandler("editOpenAIConfig", (message: EditOpenAIConfigEvent) =>
      handleEditOpenAIConfig(chatPanel, message, workspaceRoot)
    )
    .attachHandler("markdownToHtml", (message: MarkdownToHtmlEvent) =>
      handleMarkdownToHtml(message)
    )
    .attachHandler("sourceCodeToHtml", (message: SourceCodeToHtmlEvent) =>
      handleSourceCodeToHtml(message)
    )
    .attachHandler("modelChange", (message: ModelChangeEvent) =>
      handleModelChange(message, workspaceRoot)
    )
    .attachHandler("openFile", (message: OpenFileEvent) =>
      handleOpenFile(message, workspaceRoot)
    )
    .attachHandler("getMarkdown", (message: GetMarkdownEvent) =>
      handleGetMarkdown(message)
    )
    .attachHandler("cancel", async () => handleCancel(chatPanel));
}

export type ChatPanelBrokerType = BrokerType<typeof getMessageBroker>;
