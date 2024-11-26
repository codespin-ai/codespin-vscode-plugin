import { Dropdown, TextArea } from "@vscode/webview-ui-toolkit";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeLink,
  VSCodeOption,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
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
import { CSFormField } from "../../components/CSFormField.js";
import { CopyIcon } from "../../components/icons/CopyIcon.js";
import { GenerateIcon } from "../../components/icons/GenerateIcon.js";
import { GeneratePageArgs } from "./GeneratePageArgs.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { createMessageClient } from "../../../../messaging/messageClient.js";
import { BrowserEvent } from "../../../types.js";

export function Generate() {
  const vsCodeApi = getVSCodeApi();
  const args: GeneratePageArgs = history.state;
  const promptRef = useRef<TextArea>(null);

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

    const promptTextArea =
      promptRef.current!.shadowRoot!.querySelector("textarea")!;
    promptTextArea.focus();
    promptTextArea.addEventListener("keydown", onPromptTextAreaKeyDown);

    if (args.uiProps?.promptTextAreaHeight) {
      promptTextArea.style.height = `${args.uiProps.promptTextAreaHeight}px`;
      setInitialHeight(promptTextArea.clientHeight);
    }

    if (args.uiProps?.promptTextAreaWidth) {
      promptTextArea.style.width = `${args.uiProps.promptTextAreaWidth}px`;
      setInitialWidth(promptTextArea.clientWidth);
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
      promptTextArea.removeEventListener("keydown", onPromptTextAreaKeyDown);
      window.removeEventListener("message", listener);
    };
  }, []);

  function onModelChange(e: React.ChangeEvent<Dropdown>) {
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

    await generatePanelMessageClient.send("copyToClipboard", message);

    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 3000);
  }

  function onPromptTextAreaKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey ?? e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();

      generate({ prompt: (e.currentTarget as any).value });
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

    const promptTextArea =
      promptRef.current!.shadowRoot!.querySelector("textarea")!;
    if (
      promptTextArea.clientHeight !== initialHeight ||
      promptTextArea.clientWidth !== initialWidth
    ) {
      const uiPropsUpdate: UIPropsUpdateEvent = {
        type: "uiPropsUpdate",
        promptTextAreaHeight: promptTextArea.clientHeight,
        promptTextAreaWidth: promptTextArea.clientWidth,
      };

      generatePanelMessageClient.send("uiPropsUpdate", uiPropsUpdate);
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
    <div>
      <h1>Start Chatting</h1>
      <form id="mainform">
        <CSFormField label={{ text: "Model" }}>
          <VSCodeDropdown
            items={args.models.map((x) => ({
              text: x.alias ?? x.name,
              value: x.alias ?? x.name,
            }))}
            currentValue={model}
            style={{ width: "180px" }}
            onChange={onModelChange}
          >
            {args.models.map((x) => (
              <VSCodeOption key={x.alias ?? x.name} value={x.alias ?? x.name}>
                {x.alias ?? x.name}
              </VSCodeOption>
            ))}
          </VSCodeDropdown>
        </CSFormField>
        <CSFormField label={{ text: "Prompt:" }}>
          <VSCodeTextArea
            ref={promptRef as React.RefObject<any>}
            rows={10}
            cols={50}
            style={{ fontFamily: "var(--vscode-editor-font-family)" }}
            resize="both"
            onChange={(e: React.FormEvent<HTMLTextAreaElement>) =>
              setPrompt(e.currentTarget.value)
            }
            className="prompt-textarea"
            value={prompt}
          ></VSCodeTextArea>
        </CSFormField>
        <CSFormField>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <VSCodeButton
              style={{ width: "172px" }}
              onClick={onGenerateButtonClick}
            >
              <GenerateIcon />
              Start Chatting
            </VSCodeButton>

            {/* Copy to clipboard */}
            <VSCodeButton
              onClick={copyToClipboard}
              style={{ marginLeft: "8px", width: "172px" }}
            >
              {!showCopied ? <CopyIcon /> : <></>}
              {!showCopied ? "Copy To Clipboard" : "Copied"}
            </VSCodeButton>
          </div>
        </CSFormField>
        {getTotalFileSize() > 50000 ? (
          <p style={{ color: "red" }}>
            WARN: You have included {formatFileSize(getTotalFileSize())} of file
            content.{" "}
          </p>
        ) : (
          <></>
        )}

        <VSCodeDivider />
        <h3>Additional Options</h3>
        <CSFormField label={{ text: "Coding Conventions:" }}>
          <VSCodeDropdown
            style={{ width: "180px" }}
            onChange={(e: React.FormEvent<Dropdown>) =>
              setCodingConvention(
                e.currentTarget.value === "None"
                  ? undefined
                  : e.currentTarget.value
              )
            }
            currentValue={codingConvention}
          >
            <VSCodeOption key="none" value="None">
              None
            </VSCodeOption>
            {args.codingConventions.map((item) => (
              <VSCodeOption key={item.filename} value={item.filename}>
                {item.description}
              </VSCodeOption>
            ))}
          </VSCodeDropdown>
        </CSFormField>
        <CSFormField
          label={{
            text: `Included Files (${formatFileSize(getTotalFileSize())}):`,
          }}
        >
          {files.map((file) => (
            <div
              key={file.path}
              style={{
                marginBottom: "4px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <VSCodeLink onClick={() => onFileClick(file.path)}>
                {file.path}
              </VSCodeLink>
              <span style={{ marginLeft: "4px", marginRight: "1em" }}>
                {file.size ? `(${formatFileSize(file.size)})` : ""}
              </span>
              <VSCodeLink onClick={() => onAddDeps(file.path)}>
                Add deps
              </VSCodeLink>
              <VSCodeLink
                onClick={() => handleDeleteFile(file.path)}
                style={{ marginLeft: "10px", cursor: "pointer" }}
              >
                Delete
              </VSCodeLink>
              <br />
            </div>
          ))}
        </CSFormField>
      </form>
    </div>
  );
}

function getFileExtension(filename: string) {
  return filename.split(".").slice(-1)[0] ?? "";
}
