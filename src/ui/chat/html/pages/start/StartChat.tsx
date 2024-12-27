import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { formatFileSize } from "../../../../../fs/formatFileSize.js";
import { createMessageClient } from "../../../../../ipc/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { BrowserEvent } from "../../../../types.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { ModelSelector } from "./components/ModelSelector.js";
import { PromptInput } from "./components/PromptInput.js";
import { ActionButtons } from "./components/ActionButtons.js";
import { FileList } from "./components/FileList.js";
import { CodingConventionsSelector } from "./components/CodingConventionsSelector.js";
import { CodingConvention } from "../../../../../settings/conventions/CodingConvention.js";
import { ModelDescription } from "libllm";

interface MessageFile {
  path: string;
  size: number;
}

export type StartChatPageProps = {
  models: ModelDescription[];
  codingConventions: Array<CodingConvention>;
  selectedModel: string;
  codingConvention: string | undefined;
  prompt: string;
  includedFiles: {
    path: string;
    size: number;
  }[];
};

export function StartChat(props: StartChatPageProps) {
  const vsCodeApi = getVSCodeApi();

  const promptRef = useRef<HTMLTextAreaElement>(null!);

  const [model, setModel] = useState(props.selectedModel);
  const [prompt, setPrompt] = useState<string>(props.prompt ?? "");
  const [codingConvention, setCodingConvention] = useState<string | undefined>(
    props.codingConvention ?? undefined
  );
  const [messageFiles, setMessageFiles] = useState<MessageFile[]>(
    props.includedFiles
  );

  const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
    (message: unknown) => {
      vsCodeApi.postMessage(message);
    }
  );

  useEffect(() => {
    const startChatPageMessageBroker = getMessageBroker(setMessageFiles);

    function listener(event: BrowserEvent) {
      const message = event.data;
      if (startChatPageMessageBroker.canHandle(message.type)) {
        startChatPageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

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

  const totalFileSize = messageFiles.reduce(
    (acc: number, file: MessageFile) => acc + file.size,
    0
  );

  return (
    <div className="p-6 bg-vscode-editor-background">
      <h1 className="text-2xl font-bold text-vscode-editor-foreground mb-6">
        Start Generating
      </h1>
      <form id="mainform">
        <ModelSelector
          model={model}
          models={props.models}
          messageClient={chatPanelMessageClient}
          onModelChange={setModel}
        />

        <PromptInput
          prompt={prompt}
          promptRef={promptRef}
          setPrompt={setPrompt}
          onGenerate={openChat}
        />

        <ActionButtons
          messageClient={chatPanelMessageClient}
          onGenerate={openChat}
          prompt={prompt}
          codingConvention={codingConvention}
          includedFiles={messageFiles}
        />

        {totalFileSize > 50000 && (
          <p className="text-red-500">
            WARN: You have included {formatFileSize(totalFileSize)} of file
            content.
          </p>
        )}

        <div className="border-t border-vscode-panel-border mt-6 mb-2" />

        <CodingConventionsSelector
          codingConvention={codingConvention}
          conventions={props.codingConventions}
          onChange={setCodingConvention}
        />

        <FileList
          files={messageFiles}
          messageClient={chatPanelMessageClient}
          onDeleteFile={(path: string) =>
            setMessageFiles((files: MessageFile[]) =>
              files.filter((f: MessageFile) => f.path !== path)
            )
          }
          model={model}
        />
      </form>
    </div>
  );
}
