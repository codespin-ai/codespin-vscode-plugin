import { InvalidCredentialsError } from "codespin/dist/errors.js";
import * as path from "path";
import * as vscode from "vscode";
import { markdownToHtml } from "../../markdown/markdownToHtml.js";
import {
  BrokerType,
  createMessageBroker,
} from "../../messaging/messageBroker.js";
import { setDefaultModel } from "../../settings/models/setDefaultModel.js";
import { editAnthropicConfig } from "../../settings/provider/editAnthropicConfig.js";
import { editOpenAIConfig } from "../../settings/provider/editOpenAIConfig.js";
import {
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
} from "../../settings/provider/types.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { navigateTo } from "../navigateTo.js";
import { addDeps } from "./addDeps.js";
import { ChatPanel } from "./ChatPanel.js";
import { copyToClipboard } from "./copyToClipboard.js";
import {
  getModelDescription,
  getStartChatArgs
} from "./getStartChatArgs.js";
import { invokeGenerate } from "./invokeGenerate.js";
import {
  AddDepsEvent,
  ConfigPageState,
  CopyToClipboardEvent,
  MarkdownToHtmlEvent,
  ModelChangeEvent,
  NewConversationEvent,
  OpenFileEvent,
  SourceCodeToHtmlEvent,
  StartChatEvent,
  StartChatUserInput,
} from "./types.js";

export function getMessageBroker(chatPanel: ChatPanel, workspaceRoot: string) {
  async function handleAddDeps(message: AddDepsEvent) {
    await addDeps(chatPanel, message, workspaceRoot);
  }

  async function handleCopyToClipboard(message: CopyToClipboardEvent) {
    await copyToClipboard(message, workspaceRoot);

    const newConversations: NewConversationEvent = {
      type: "newConversation",
    };

    chatPanel.globalEventEmitter.emit("message", newConversations);
  }

  async function handleStartChat(startChatInput: StartChatUserInput) {
    const startChatArgs = await getStartChatArgs(startChatInput, workspaceRoot);

    switch (startChatArgs.status) {
      case "can_start_chat":
        try {
          await invokeGenerate(
            chatPanel,
            startChatArgs.args,
            startChatInput,
            workspaceRoot
          );
        } catch (ex: any) {
          if (ex instanceof InvalidCredentialsError) {
            const modelDescription = await getModelDescription(workspaceRoot);

            const configPageState: ConfigPageState = {
              provider: modelDescription.provider,
              returnTo: "/chat",
              startChatUserInput: startChatInput,
            };

            await navigateTo(
              chatPanel,
              `/provider/config/edit`,
              configPageState
            );
            break;
          }
        } finally {
          const newConversation: NewConversationEvent = {
            type: "newConversation",
          };
          chatPanel.globalEventEmitter.emit("message", newConversation);
        }
        break;
      case "missing_config":
        await navigateTo(
          chatPanel,
          `/provider/config/edit`,
          startChatArgs.configPageState
        );
        break;
    }
  }

  async function handleEditAnthropicConfig(message: EditAnthropicConfigEvent) {
    await editAnthropicConfig(message);
    const startChatUserInput: StartChatUserInput = message.startChatUserInput;
    handleStartChat(startChatUserInput);
  }

  async function handleEditOpenAIConfig(message: EditOpenAIConfigEvent) {
    await editOpenAIConfig(message);
    const startChatUserInput: StartChatUserInput = message.startChatUserInput;
    handleStartChat(startChatUserInput);
  }

  async function handleMarkdownToHtml(event: MarkdownToHtmlEvent) {
    return markdownToHtml(event.content);
  }

  async function handleSourceCodeToHtml(event: SourceCodeToHtmlEvent) {
    return getHtmlForCode(event.content, getLangFromFilename(event.filePath));
  }

  async function handleModelChange(message: ModelChangeEvent) {
    await setDefaultModel(message.model, workspaceRoot);
    return 100;
  }

  async function handleOpenFile(message: OpenFileEvent) {
    const filePath = path.resolve(workspaceRoot, message.file);
    const uri = vscode.Uri.file(filePath);
    vscode.window.showTextDocument(uri, {
      preview: false,
      preserveFocus: false,
    });
  }

  async function handleCancel(chatPanel: ChatPanel) {
    if (chatPanel.cancelGeneration) {
      chatPanel.cancelGeneration();
    }
    chatPanel.dispose();
  }

  const messageBroker = createMessageBroker()
    .attachHandler("addDeps", async (message: AddDepsEvent) => {
      await handleAddDeps(message);
    })
    .attachHandler("copyToClipboard", async (message: CopyToClipboardEvent) => {
      await handleCopyToClipboard(message);
    })
    .attachHandler("startChat", async (message: StartChatEvent) => {
      await handleStartChat(message);
    })
    .attachHandler(
      "editAnthropicConfig",
      async (message: EditAnthropicConfigEvent) => {
        await handleEditAnthropicConfig(message);
      }
    )
    .attachHandler(
      "editOpenAIConfig",
      async (message: EditOpenAIConfigEvent) => {
        await handleEditOpenAIConfig(message);
      }
    )
    .attachHandler("markdownToHtml", async (event: MarkdownToHtmlEvent) => {
      return handleMarkdownToHtml(event);
    })
    .attachHandler("sourceCodeToHtml", async (event: SourceCodeToHtmlEvent) => {
      return handleSourceCodeToHtml(event);
    })
    .attachHandler("modelChange", async (message: ModelChangeEvent) => {
      return handleModelChange(message);
    })
    .attachHandler("openFile", async (message: OpenFileEvent) => {
      await handleOpenFile(message);
    })
    .attachHandler("cancel", async () => {
      await handleCancel(chatPanel);
    });

  return messageBroker;
}

export type ChatPanelBrokerType = BrokerType<typeof getMessageBroker>;
