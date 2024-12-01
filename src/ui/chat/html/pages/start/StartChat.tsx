import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { CopyIcon } from "../../components/icons/CopyIcon.js";
import { GenerateIcon } from "../../components/icons/GenerateIcon.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { BrowserEvent } from "../../../../types.js";
import { formatFileSize } from "../../../../../fs/formatFileSize.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import { AddDepsEvent, StartChatEvent, OpenFileEvent } from "../../../types.js";
import { StartChatPageArgs } from "./StartChatPageArgs.js";
import { ChatIcon } from "../../components/icons/ChatIcon.js";

export function StartChat() {
  const vsCodeApi = getVSCodeApi();
  const args: StartChatPageArgs = history.state;
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const [model, setModel] = useState(args.selectedModel);
  const [prompt, setPrompt] = useState<string>(args.prompt ?? "");
  const [codingConvention, setCodingConvention] = useState<string | undefined>(
    args.codingConvention ?? "None"
  );
  const [files, setFiles] = useState<{ path: string; size: number }[]>(
    args.includedFiles
  );

  const [showCopied, setShowCopied] = useState(false);

  const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
    (message: unknown) => {
      vsCodeApi.postMessage(message);
    }
  );

  useEffect(() => {
    if (files.length >= 1) {
      const fileExtension = getFileExtension(files[0].path);
      if (files.every((x) => x.path.endsWith(fileExtension))) {
        const matchingConvention = args.codingConventions.find((convention) => {
          return convention.extensions.includes(fileExtension);
        });

        if (matchingConvention) {
          setCodingConvention(matchingConvention.filename);
        } else {
          setCodingConvention(undefined);
        }
      }
    }

    if (promptRef.current) {
      promptRef.current.focus();
      promptRef.current.addEventListener("keydown", onPromptTextAreaKeyDown);
    }

    const startChatPageMessageBroker = getMessageBroker(setFiles);

    function listener(event: BrowserEvent) {
      const message = event.data;

      if (startChatPageMessageBroker.canHandle(message.type)) {
        startChatPageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listener);

    return () => {
      promptRef.current?.removeEventListener(
        "keydown",
        onPromptTextAreaKeyDown
      );
      window.removeEventListener("message", listener);
    };
  }, []);

  function onModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setModel(e.target.value);

    const modelChangeMessage = {
      type: "modelChange" as const,
      model: e.target.value,
    };

    chatPanelMessageClient.send("modelChange", modelChangeMessage);
  }

  function onGenerateButtonClick() {
    generate({});
  }

  async function copyToClipboard() {
    const message = {
      type: "copyToClipboard" as const,
      includedFiles: files,
      prompt,
      codingConvention,
    };

    chatPanelMessageClient.send("copyToClipboard", message);

    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 3000);
  }

  function onPromptTextAreaKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey ?? e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();

      generate({ prompt: (e.currentTarget as HTMLTextAreaElement).value });
    }
  }

  function generate(args: Partial<StartChatEvent>) {
    const message: StartChatEvent = {
      type: "startChat",
      includedFiles: files,
      model,
      prompt,
      codingConvention,
      ...args,
    };

    chatPanelMessageClient.send("startChat", message);
  }

  function handleDeleteFile(filePath: string) {
    setFiles(files.filter((file) => file.path !== filePath));
  }

  function onAddDeps(filePath: string) {
    const message: AddDepsEvent = {
      type: "addDeps",
      file: filePath,
      model,
    };
    chatPanelMessageClient.send("addDeps", message);
  }

  function onFileClick(filePath: string) {
    const message: OpenFileEvent = {
      type: "openFile",
      file: filePath,
    };
    chatPanelMessageClient.send("openFile", message);
  }

  function getTotalFileSize(): number {
    return files.reduce((acc, file) => acc + file.size, 0);
  }

  return (
    <div className="p-6 bg-vscode-editor-background">
      <h1 className="text-2xl font-bold text-vscode-editor-foreground mb-6">
        Start Generating
      </h1>
      <form id="mainform">
        <div className="mb-4">
          <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
            Model
          </label>
          <select
            value={model}
            onChange={onModelChange}
            className="w-48 px-1 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
          >
            {args.models.map((x) => (
              <option key={x.alias ?? x.name} value={x.alias ?? x.name}>
                {x.alias ?? x.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
            Prompt:
          </label>
          <textarea
            ref={promptRef}
            rows={10}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="max-w-3xl w-full px-3 py-2 bg-vscode-input-background border border-vscode-input-border rounded text-vscode-input-foreground font-vscode-editor resize-both focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
          />
        </div>

        <div className="flex gap-4 mb-4">
          <button
            style={{ width: "180px" }}
            type="button"
            onClick={onGenerateButtonClick}
            className="flex justify-center items-center py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
          >
            <ChatIcon height="24px" width="24px" />
            <span className="ml-2">Start Chatting</span>
          </button>

          <button
            style={{ width: "180px" }}
            type="button"
            onClick={copyToClipboard}
            className="flex justify-center items-center py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
          >
            {!showCopied && <CopyIcon height="24px" width="24px" />}
            <span className="ml-2">
              {showCopied ? "Copied" : "Copy To Clipboard"}
            </span>
          </button>
        </div>

        {getTotalFileSize() > 50000 && (
          <p className="text-red-500">
            WARN: You have included {formatFileSize(getTotalFileSize())} of file
            content.
          </p>
        )}

        <div className="border-t border-vscode-panel-border mt-6 mb-2" />

        <div className="mb-4">
          <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
            Coding Conventions:
          </label>
          <select
            value={codingConvention}
            onChange={(e) =>
              setCodingConvention(
                e.target.value === "None" ? undefined : e.target.value
              )
            }
            className="w-48 px-1 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
          >
            <option value="None">None</option>
            {args.codingConventions.map((item) => (
              <option key={item.filename} value={item.filename}>
                {item.description}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
            Included Files ({formatFileSize(getTotalFileSize())}):
          </label>
          <div>
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center gap-4 text-vscode-editor-foreground"
              >
                <button
                  type="button"
                  onClick={() => onFileClick(file.path)}
                  className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
                >
                  {file.path}
                </button>
                <span className="text-vscode-editor-foreground opacity-60">
                  {file.size ? `(${formatFileSize(file.size)})` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => onAddDeps(file.path)}
                  className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
                >
                  Add deps
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.path)}
                  className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

function getFileExtension(filename: string) {
  return filename.split(".").slice(-1)[0] ?? "";
}
