import {
  BrokerType,
  createMessageBroker,
} from "../../messaging/messageBroker.js";
import { handleAddDeps } from "./handlers/handleAddDeps.js";
import { handleCancel } from "./handlers/handleCancel.js";
import { handleCopyToClipboard } from "./handlers/handleCopyToClipboard.js";
import { handleEditAnthropicConfig } from "./handlers/handleEditAnthropicConfig.js";
import { handleEditOpenAIConfig } from "./handlers/handleEditOpenAIConfig.js";
import { handleMarkdownToHtml } from "./handlers/handleMarkdownToHtml.js";
import { handleModelChange } from "./handlers/handleModelChange.js";
import { handleOpenFile } from "./handlers/handleOpenFile.js";
import { handleSourceCodeToHtml } from "./handlers/handleSourceCodeToHtml.js";
import { handleStartChat } from "./handlers/handleStartChat.js";
import { ChatPanel } from "./ChatPanel.js";
import {
  AddDepsEvent,
  CopyToClipboardEvent,
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
  MarkdownToHtmlEvent,
  ModelChangeEvent,
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
    .attachHandler("startChat", (message: StartChatEvent) =>
      handleStartChat(chatPanel, message, workspaceRoot)
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
    .attachHandler("cancel", async () => handleCancel(chatPanel));
}

export type ChatPanelBrokerType = BrokerType<typeof getMessageBroker>;
