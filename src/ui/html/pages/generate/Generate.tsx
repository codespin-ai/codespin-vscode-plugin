import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { formatFileSize } from "../../../../text/formatFileSize.js";
import { getVSCodeApi } from "../../../../vscode/getVSCodeApi.js";
import type { GeneratePanelBrokerType } from "../../../panels/generate/getMessageBroker.js";
import {
  AddDepsEvent,
  GenerateEvent,
  OpenFileEvent,
  UIPropsUpdateEvent,
} from "../../../panels/generate/types.js";
import { CopyIcon } from "../../components/icons/CopyIcon.js";
import { GenerateIcon } from "../../components/icons/GenerateIcon.js";
import { GeneratePageArgs } from "./GeneratePageArgs.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { createMessageClient } from "../../../../messaging/messageClient.js";
import { BrowserEvent } from "../../../types.js";

export function Generate() {
  const vsCodeApi = getVSCodeApi();
  const args: GeneratePageArgs = history.state;
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const [model, setModel] = useState(args.selectedModel);
  const [prompt, setPrompt] = useState<string>(args.prompt ?? "");
  const [codingConvention, setCodingConvention] = useState<string | undefined>(
    args.codingConvention ?? "None"
  );
  const [files, setFiles] = useState<{ path: string; size: number }[]>(
    args.includedFiles
  );

  const [initialHeight, setInitialHeight] = useState(
    args.uiProps?.promptTextAreaHeight ?? 0
  );

  const [initialWidth, setInitialWidth] = useState(
    args.uiProps?.promptTextAreaWidth ?? 0
  );

  const [showCopied, setShowCopied] = useState(false);

  const generatePanelMessageClient =
    createMessageClient<GeneratePanelBrokerType>((message: unknown) => {
      vsCodeApi.postMessage(message);
    });

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

      if (args.uiProps?.promptTextAreaHeight) {
        promptRef.current.style.height = `${args.uiProps.promptTextAreaHeight}px`;
        setInitialHeight(promptRef.current.clientHeight);
      }

      if (args.uiProps?.promptTextAreaWidth) {
        promptRef.current.style.width = `${args.uiProps.promptTextAreaWidth}px`;
        setInitialWidth(promptRef.current.clientWidth);
      }
    }

    const generatePageMessageBroker = getMessageBroker(setFiles);

    function listener(event: BrowserEvent) {
      const message = event.data;

      if (generatePageMessageBroker.canHandle(message.type)) {
        generatePageMessageBroker.handleRequest(message as any);
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

    generatePanelMessageClient.send("modelChange", modelChangeMessage);
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

    generatePanelMessageClient.send("copyToClipboard", message);

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

  function generate(args: Partial<GenerateEvent>) {
    const message: GenerateEvent = {
      type: "generate",
      includedFiles: files,
      model,
      prompt,
      codingConvention,
      ...args,
    };

    generatePanelMessageClient.send("generate", message);

    if (promptRef.current) {
      if (
        promptRef.current.clientHeight !== initialHeight ||
        promptRef.current.clientWidth !== initialWidth
      ) {
        const uiPropsUpdate: UIPropsUpdateEvent = {
          type: "uiPropsUpdate",
          promptTextAreaHeight: promptRef.current.clientHeight,
          promptTextAreaWidth: promptRef.current.clientWidth,
        };

        generatePanelMessageClient.send("uiPropsUpdate", uiPropsUpdate);
      }
    }
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
    generatePanelMessageClient.send("addDeps", message);
  }

  function onFileClick(filePath: string) {
    const message: OpenFileEvent = {
      type: "openFile",
      file: filePath,
    };
    generatePanelMessageClient.send("openFile", message);
  }

  function getTotalFileSize(): number {
    return files.reduce((acc, file) => acc + file.size, 0);
  }

  return (
    <div className="p-6 bg-vscode-editor-background">
      <h1 className="text-2xl font-bold text-vscode-editor-foreground mb-6">
        Start Generating
      </h1>
      <form id="mainform" className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-vscode-editor-foreground">
            Model
          </label>
          <select
            value={model}
            onChange={onModelChange}
            className="w-48 px-3 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded-lg text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
          >
            {args.models.map((x) => (
              <option key={x.alias ?? x.name} value={x.alias ?? x.name}>
                {x.alias ?? x.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-vscode-editor-foreground">
            Prompt:
          </label>
          <textarea
            ref={promptRef}
            rows={10}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 bg-vscode-input-background border border-vscode-input-border rounded-lg text-vscode-input-foreground font-vscode-editor resize-both focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onGenerateButtonClick}
            className="flex items-center px-6 py-2 bg-vscode-button-background text-vscode-button-foreground rounded-lg font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
          >
            <GenerateIcon />
            Start Generating
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center px-6 py-2 bg-vscode-button-background text-vscode-button-foreground rounded-lg font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
          >
            {!showCopied && <CopyIcon />}
            {showCopied ? "Copied" : "Copy To Clipboard"}
          </button>
        </div>

        {getTotalFileSize() > 50000 && (
          <p className="text-red-500">
            WARN: You have included {formatFileSize(getTotalFileSize())} of file
            content.
          </p>
        )}

        <div className="border-t border-vscode-panel-border my-6" />

        <h3 className="text-lg font-medium text-vscode-editor-foreground">
          Additional Options
        </h3>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-vscode-editor-foreground">
            Coding Conventions:
          </label>
          <select
            value={codingConvention}
            onChange={(e) =>
              setCodingConvention(
                e.target.value === "None" ? undefined : e.target.value
              )
            }
            className="w-48 px-3 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded-lg text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
          >
            <option value="None">None</option>
            {args.codingConventions.map((item) => (
              <option key={item.filename} value={item.filename}>
                {item.description}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-vscode-editor-foreground">
            Included Files ({formatFileSize(getTotalFileSize())}):
          </label>
          <div className="space-y-2">
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
