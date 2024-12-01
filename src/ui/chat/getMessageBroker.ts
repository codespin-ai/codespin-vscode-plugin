import * as path from "path";
import * as vscode from "vscode";
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
import { navigateTo } from "../navigateTo.js";
import { addDeps } from "./addDeps.js";
import { ChatPanel } from "./ChatPanel.js";
import { copyToClipboard } from "./copyToClipboard.js";
import { getStartChatArgs } from "./getStartChatArgs.js";
import { invokeGenerate } from "./invokeGenerate.js";
import {
  AddDepsEvent,
  CopyToClipboardEvent,
  ModelChangeEvent,
  NewConversationEvent,
  OpenFileEvent,
  StartChatEvent,
} from "./types.js";

export function getMessageBroker(chatPanel: ChatPanel, workspaceRoot: string) {
  const messageBroker = createMessageBroker()
    .attachHandler("addDeps", async (message: AddDepsEvent) => {
      await addDeps(chatPanel, message, workspaceRoot);
    })
    .attachHandler("copyToClipboard", async (message: CopyToClipboardEvent) => {
      await copyToClipboard(message, workspaceRoot);

      const newConversations: NewConversationEvent = {
        type: "newConversation",
      };

      chatPanel.globalEventEmitter.emit("message", newConversations);
    })
    .attachHandler("startChat", async (message: unknown) => {
      chatPanel.userInput = message as StartChatEvent;

      const startChatArgs = await getStartChatArgs(chatPanel, workspaceRoot);

      switch (startChatArgs.status) {
        case "can_start_chat":
          try {
            await invokeGenerate(chatPanel, startChatArgs, workspaceRoot);
          } finally {
            const newConversation: NewConversationEvent = {
              type: "newConversation",
            };
            chatPanel.globalEventEmitter.emit("message", newConversation);
          }
          break;
        case "missing_config":
          await navigateTo(chatPanel, `/provider/config/edit`, {
            provider: startChatArgs.provider,
          });
          break;
      }
    })
    .attachHandler(
      "editAnthropicConfig",
      async (message: EditAnthropicConfigEvent) => {
        await editAnthropicConfig(message);
        await chatPanel.onMessage(chatPanel.userInput!);
      }
    )
    .attachHandler(
      "editOpenAIConfig",
      async (message: EditOpenAIConfigEvent) => {
        await editOpenAIConfig(message);
        await chatPanel.onMessage(chatPanel.userInput!);
      }
    )
    .attachHandler("modelChange", async (message: ModelChangeEvent) => {
      await setDefaultModel(message.model, workspaceRoot);
      return 100;
    })
    .attachHandler("openFile", async (message: OpenFileEvent) => {
      const filePath = path.resolve(workspaceRoot, message.file);
      const uri = vscode.Uri.file(filePath);
      vscode.window.showTextDocument(uri, {
        preview: false,
        preserveFocus: false,
      });
    })
    .attachHandler("cancel", async () => {
      if (chatPanel.cancelGeneration) {
        chatPanel.cancelGeneration();
      }
      chatPanel.dispose();
    });

  return messageBroker;
}

export type ChatPanelBrokerType = BrokerType<typeof getMessageBroker>;
