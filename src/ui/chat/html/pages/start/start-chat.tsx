import { component, Component } from "magic-loop";import { Router } from "magic-loop-router";
import { formatFileSize } from "../../../../../fs/formatFileSize.js";
import { createMessageClient } from "../../../../../ipc/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { BrowserEvent } from "../../../../types.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { CodingConvention } from "../../../../../settings/conventions/CodingConvention.js";
import * as libllm from "libllm";

interface MessageFile {
  path: string;
  size: number;
}

export type StartChatProps = {
  models: libllm.types.ModelDescription[];
  codingConventions: Array<CodingConvention>;
  selectedModel: string;
  codingConvention: string | undefined;
  prompt: string;
  includedFiles: {
    path: string;
    size: number;
  }[];
  messageListener?: (event: BrowserEvent) => void;
};

export async function* StartChat(
  component: HTMLElement & Component & StartChatProps
) {
  const vsCodeApi = getVSCodeApi();
  const promptRef = { current: null as HTMLTextAreaElement | null };

  let model = component.selectedModel;
  let prompt = component.prompt ?? "";
  let codingConvention = component.codingConvention ?? undefined;
  let messageFiles = component.includedFiles;

  const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
    (message: unknown) => {
      vsCodeApi.postMessage(message);
    }
  );

  // Set up message broker for handling file inclusions
  const startChatPageMessageBroker = getMessageBroker((fileUpdateFn) => {
    messageFiles = fileUpdateFn(messageFiles);
    component.render();
  });

  // Create message listener and attach to component for cleanup
  component.messageListener = (event: BrowserEvent) => {
    const message = event.data;
    if (startChatPageMessageBroker.canHandle(message.type)) {
      startChatPageMessageBroker.handleRequest(message as any);
    }
  };

  const openChat = () => {
    chatPanelMessageClient.send("newConversation", {
      type: "newConversation",
      model,
      codingConvention,
      prompt,
      includedFiles: messageFiles.map((file: MessageFile) => ({
        path: file.path,
        size: file.size,
      })),
    });
  };

  while (true) {
    const totalFileSize = messageFiles.reduce(
      (acc: number, file: MessageFile) => acc + file.size,
      0
    );

    yield (
      <div class="p-6 bg-vscode-editor-background">
        <h1 class="text-2xl font-bold text-vscode-editor-foreground mb-6">
          Start Generating
        </h1>
        <form id="mainform">
          <model-selector
            model={model}
            models={component.models}
            messageClient={chatPanelMessageClient}
            onModelChange={(newModel: string) => {
              model = newModel;
              component.render();
            }}
          />

          <prompt-input
            prompt={prompt}
            promptRef={promptRef}
            setPrompt={(newPrompt: string) => {
              prompt = newPrompt;
              component.render();
            }}
            onGenerate={openChat}
          />

          <action-buttons
            messageClient={chatPanelMessageClient}
            onGenerate={openChat}
            prompt={prompt}
            codingConvention={codingConvention}
            includedFiles={messageFiles}
          />

          {totalFileSize > 50000 && (
            <p class="text-red-500">
              WARN: You have included {formatFileSize(totalFileSize)} of file
              content.
            </p>
          )}

          <div class="border-t border-vscode-panel-border mt-6 mb-2" />

          <coding-conventions-selector
            codingConvention={codingConvention}
            conventions={component.codingConventions}
            onChange={(newConvention: string | undefined) => {
              codingConvention = newConvention;
              component.render();
            }}
          />

          <file-list
            files={messageFiles}
            messageClient={chatPanelMessageClient}
            onDeleteFile={(path: string) => {
              messageFiles = messageFiles.filter(
                (f: MessageFile) => f.path !== path
              );
              component.render();
            }}
            model={model}
          />
        </form>
      </div>
    );
  }
}

component(
  "start-chat",
  StartChat,
  {
    models: [],
    codingConventions: [],
    selectedModel: "",
    codingConvention: undefined,
    prompt: "",
    includedFiles: [],
    messageListener: undefined,
  },
  {
    onConnected: (component) => {
      window.addEventListener("message", component.messageListener!);
    },
    onDisconnected: (component) => {
      window.removeEventListener("message", component.messageListener!);
    },
  }
);
