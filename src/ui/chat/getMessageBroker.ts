import { InvalidCredentialsError } from "codespin/dist/errors.js";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getFilesRecursive } from "../../fs/getFilesRecursive.js";
import { pathExists } from "../../fs/pathExists.js";
import { markdownToHtml } from "../../markdown/markdownToHtml.js";
import {
  BrokerType,
  createMessageBroker,
} from "../../messaging/messageBroker.js";
import { createMessageClient } from "../../messaging/messageClient.js";
import { setDefaultModel } from "../../settings/models/setDefaultModel.js";
import { editAnthropicConfig } from "../../settings/provider/editAnthropicConfig.js";
import { editOpenAIConfig } from "../../settings/provider/editOpenAIConfig.js";
import {
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
} from "../../settings/provider/types.js";
import { addDeps } from "../../sourceAnalysis/addDeps.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { navigateTo } from "../navigateTo.js";
import { ChatPanel } from "./ChatPanel.js";
import { copyToClipboard, CopyToClipboardEvent } from "./copyToClipboard.js";
import { getModelDescription, getStartChatArgs } from "./getStartChatArgs.js";
import type { ConfigPageState } from "./html/pages/provider/EditConfig.js";
import { StartChatPageBrokerType } from "./html/pages/start/getMessageBroker.js";
import { invokeGenerate } from "./invokeGenerate.js";
import { StartChatEvent, StartChatUserInput } from "./types.js";
import { includeFiles, IncludeFilesEvent } from "./includeFiles.js";

export type OpenFileArgs = {
  file: string;
};

export type OpenFileEvent = {
  type: "openFile";
} & OpenFileArgs;

export type AddDepsArgs = {
  file: string;
  model: string;
};

export type AddDepsEvent = {
  type: "addDeps";
} & AddDepsArgs;

export type ModelChange = {
  model: string;
};

export type ModelChangeEvent = {
  type: "modelChange";
} & ModelChange;

export type MarkdownToHtmlArgs = {
  content: string;
};

export type MarkdownToHtmlEvent = {
  type: "markdownToHtml";
} & MarkdownToHtmlArgs;

export type SourceCodeToHtmlArgs = {
  content: string;
};

export type SourceCodeToHtmlEvent = {
  type: "sourceCodeToHtml";
  filePath: string;
} & SourceCodeToHtmlArgs;

export type NewConversationEvent = {
  type: "newConversation";
};

export function getMessageBroker(chatPanel: ChatPanel, workspaceRoot: string) {
  async function handleAddDeps(message: AddDepsEvent) {
    const dependenciesResult = await addDeps(
      message.file,
      message.model,
      workspaceRoot
    );

    const filePaths = (
      await Promise.all(
        dependenciesResult.dependencies
          .filter((x) => x.isProjectFile)
          .map(async (x) => {
            const fullPath = path.resolve(workspaceRoot, x.filePath);
            const fileExists = await pathExists(fullPath);
            return fileExists ? fullPath : undefined;
          })
      )
    ).filter(Boolean) as string[];

    await includeFiles(chatPanel, filePaths, workspaceRoot);
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
