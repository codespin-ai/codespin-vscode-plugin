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
import {
  AddDepsEvent,
  CopyToClipboardEvent,
  FileVersions,
  GenerateEvent,
  IncludeFilesEvent,
  ModelChangeEvent,
  OpenFileEvent,
  UIPropsUpdateEvent,
} from "../../../panels/generate/types.js";
import { CSFormField } from "../../components/CSFormField.js";
import { GeneratePageArgs } from "./GeneratePageArgs.js";

export function Generate() {
  const vsCodeApi = getVSCodeApi();
  const args: GeneratePageArgs = history.state;
  const promptRef = useRef<TextArea>(null);

  const [model, setModel] = useState(args.selectedModel);
  const [prompt, setPrompt] = useState<string>(args.prompt ?? "");
  const [codegenTargets, setCodegenTargets] = useState(
    args.codegenTargets ?? ":prompt"
  );
  const [codingConvention, setCodingConvention] = useState<string | undefined>(
    args.codingConvention ?? "None"
  );
  const [fileVersion, setFileVersion] = useState<FileVersions>(
    args.fileVersion ?? "current"
  );
  const [files, setFiles] = useState<{ path: string; size: number }[]>(
    args.includedFiles
  );

  const [outputKind, setOutputKind] = useState<"full" | "diff">(
    args.outputKind ?? "full"
  );

  const [multi, setMulti] = useState(args.multi ?? 0);

  const [initialHeight, setInitialHeight] = useState(
    args.uiProps?.promptTextAreaHeight ?? 0
  );

  const [initialWidth, setInitialWidth] = useState(
    args.uiProps?.promptTextAreaWidth ?? 0
  );

  const [showCopied, setShowCopied] = useState(false);

  function onOutputKindChange(e: React.ChangeEvent<Dropdown>) {
    setOutputKind(e.target.value as "full" | "diff");
  }

  function onMultiChange(e: React.ChangeEvent<Dropdown>) {
    setMulti(Number(e.target.value));
  }

  useEffect(() => {
    if (files.length === 1) {
      setCodegenTargets(files[0].path);
    }

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

    function listener(event: unknown) {
      const message = (event as any).data;
      switch (message.type) {
        case "includeFiles":
          setFiles((files) => {
            const includeFilesMessage: IncludeFilesEvent = message;

            const newFiles = includeFilesMessage.files.filter((x) =>
              files.every((file) => file.path !== x.path)
            );

            return files.concat(
              newFiles.map((file) => ({
                path: file.path,
                includeOption: "source",
                size: file.size,
              }))
            );
          });
          break;
      }
    }

    window.addEventListener("message", listener);

    return () => {
      promptTextArea.removeEventListener("keydown", onPromptTextAreaKeyDown);
      window.removeEventListener("message", listener);
    };
  }, []);

  useEffect(() => {
    const targetExtension =
      codegenTargets !== ":prompt"
        ? getFileExtension(codegenTargets)
        : undefined;

    if (targetExtension) {
      const matchingConvention = args.codingConventions.find((convention) => {
        return convention.extensions.includes(targetExtension);
      });

      if (matchingConvention) {
        setCodingConvention(matchingConvention.filename);
      } else {
        setCodingConvention(undefined);
      }
    } else {
      setCodingConvention(undefined);
    }
  }, [codegenTargets]);

  function onModelChange(e: React.ChangeEvent<Dropdown>) {
    setModel(e.target.value);
    const modelChangeMessage: ModelChangeEvent = {
      type: "modelChange",
      model: e.target.value,
    };
    vsCodeApi.postMessage(modelChangeMessage);
  }

  function onGenerateButtonClick() {
    generate({});
  }

  function copyToClipboard() {
    const message: CopyToClipboardEvent = {
      type: "copyToClipboard",
      model,
      includedFiles: files,
      prompt,
      codegenTargets,
      codingConvention,
      fileVersion,
      outputKind,
      multi,
    };
    vsCodeApi.postMessage(message);

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
      codegenTargets,
      codingConvention,
      fileVersion,
      outputKind,
      multi,
      ...args,
    };
    vsCodeApi.postMessage(message);

    const promptTextArea =
      promptRef.current!.shadowRoot!.querySelector("textarea")!;
    if (
      promptTextArea.clientHeight !== initialHeight ??
      promptTextArea.clientWidth !== initialWidth
    ) {
      const uiPropsUpdate: UIPropsUpdateEvent = {
        type: "uiPropsUpdate",
        promptTextAreaHeight: promptTextArea.clientHeight,
        promptTextAreaWidth: promptTextArea.clientWidth,
      };

      vsCodeApi.postMessage(uiPropsUpdate);
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
    vsCodeApi.postMessage(message);
  }

  function onFileClick(filePath: string) {
    const message: OpenFileEvent = {
      type: "openFile",
      file: filePath,
    };
    vsCodeApi.postMessage(message);
  }

  function getTotalFileSize(): number {
    return files.reduce((acc, file) => acc + file.size, 0);
  }

  return (
    <div>
      <h1>Generate</h1>
      <form id="mainform">
        <CSFormField label={{ text: "Model" }}>
          <VSCodeDropdown
            items={Object.keys(args.models).map((x) => ({
              text: x,
              value: args.models[x],
            }))}
            currentValue={model}
            style={{ width: "180px" }}
            onChange={onModelChange}
          >
            {Object.keys(args.models).map((x) => (
              <VSCodeOption key={x} value={args.models[x]}>
                {x}
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
            <VSCodeButton onClick={onGenerateButtonClick}>
              Generate Code
            </VSCodeButton>
            {!showCopied && (
              <VSCodeLink
                style={{ marginLeft: "1em" }}
                onClick={copyToClipboard}
              >
                Copy To Clipboard
              </VSCodeLink>
            )}
            {showCopied && (
              <span style={{ marginLeft: "1em", color: "white" }}>Copied</span>
            )}
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
        <CSFormField label={{ text: "Files to generate:" }}>
          <VSCodeDropdown
            currentValue={codegenTargets}
            style={{ width: "420px" }}
            onChange={(e: React.ChangeEvent<Dropdown>) =>
              setCodegenTargets(e.target.value)
            }
          >
            {[{ text: "As in Prompt", value: ":prompt" }]
              .concat(
                files.map((x) => ({
                  text: x.path,
                  value: `${x.path}`,
                }))
              )
              .map((item) => (
                <VSCodeOption key={item.value} value={item.value}>
                  {item.text}
                </VSCodeOption>
              ))}
          </VSCodeDropdown>
        </CSFormField>
        <CSFormField label={{ text: "Output Kind:" }}>
          <VSCodeDropdown
            currentValue={outputKind}
            style={{ width: "180px" }}
            onChange={onOutputKindChange}
          >
            <VSCodeOption value="full">Full Content</VSCodeOption>
            <VSCodeOption value="diff">Diff</VSCodeOption>
          </VSCodeDropdown>
        </CSFormField>
        {outputKind === "full" ? (
          <CSFormField label={{ text: "Continue after max tokens?:" }}>
            <VSCodeDropdown
              currentValue={multi.toString()}
              style={{ width: "180px" }}
              onChange={onMultiChange}
            >
              {[
                { text: "No", value: "0" },
                { text: "Up to 4 times", value: "4" },
                { text: "Up to 8 times", value: "8" },
                { text: "Up to 12 times", value: "12" },
              ].map((x) => (
                <VSCodeOption value={x.value}>{x.text}</VSCodeOption>
              ))}
            </VSCodeDropdown>
          </CSFormField>
        ) : (
          <></>
        )}
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
        <CSFormField label={{ text: "File Version:" }}>
          <VSCodeDropdown
            currentValue="current"
            style={{ width: "180px" }}
            onChange={(e: React.ChangeEvent<Dropdown>) =>
              setFileVersion(e.target.value as FileVersions)
            }
          >
            {[
              { text: "Working Copy", value: "current" },
              { text: "Git HEAD", value: "HEAD" },
            ].map((item) => (
              <VSCodeOption key={item.value} value={item.value}>
                {item.text}
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
