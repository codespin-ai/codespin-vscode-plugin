import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeLink,
  VSCodeOption,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useState, useEffect, useRef } from "react"; // Import useRef
import { CSFormField } from "../../components/CSFormField.js";
import { GeneratePageArgs } from "./GeneratePageArgs.js";
import { Dropdown, TextArea } from "@vscode/webview-ui-toolkit";
import { getVsCodeApi } from "../../../../vscode/getVsCodeApi.js";
import { ArgsFromGeneratePanel } from "../../../panels/generate/ArgsFromGeneratePanel.js";
import { EventTemplate } from "../../../EventTemplate.js";
import { ModelChange } from "../../../panels/generate/ModelChange.js";
import { formatFileSize } from "../../../../text/formatFileSize.js";
import {
  FileVersions,
  IncludeFilesEventArgs,
  IncludeOptions,
} from "../../../panels/generate/eventArgs.js";

export function Generate() {
  const vsCodeApi = getVsCodeApi();
  const args: GeneratePageArgs = history.state;
  const promptRef = useRef<TextArea>(null);

  const [model, setModel] = useState(args.selectedModel);
  const [prompt, setPrompt] = useState<string>(args.prompt || "");
  const [codegenTargets, setCodegenTargets] = useState(
    args.codegenTargets || ":prompt"
  );
  const [codingConvention, setCodingConvention] = useState<string | undefined>(
    args.codingConvention
  );
  const [fileVersion, setFileVersion] = useState<FileVersions>(
    args.fileVersion || "current"
  );
  const [files, setFiles] = useState<
    { path: string; size: number; includeOption: IncludeOptions }[]
  >(args.files);

  useEffect(() => {
    if (files.length === 1) {
      setCodegenTargets(files[0].path);
    }

    if (files.length >= 1) {
      const fileExtension = getFileExtension(files[0].path);
      if (files.every((x) => x.path.endsWith(fileExtension))) {
        const matchingConvention = args.codingConventions.find((convention) => {
          return convention.extension === fileExtension;
        });

        if (matchingConvention) {
          setCodingConvention(matchingConvention.filename);
        } else {
          setCodingConvention(undefined);
        }
      }
    }

    const promptTextArea = promptRef.current!;

    promptTextArea.focus();
    promptTextArea.addEventListener("keydown", onPromptTextAreaKeyDown);

    function listener(event: unknown) {
      const message = (event as any).data;
      switch (message.type) {
        case "includeFiles":
          setFiles((files) => {
            const includeFilesMessage: IncludeFilesEventArgs = message;

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
        return convention.extension === targetExtension;
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
    const message: EventTemplate<ModelChange> = {
      type: "modelChange",
      model,
    };
    vsCodeApi.postMessage(message);
  }

  function onGenerateButtonClick() {
    const message: EventTemplate<ArgsFromGeneratePanel> = {
      type: "generate",
      model,
      includedFiles: files,
      prompt,
      codegenTargets,
      codingConvention,
      fileVersion,
    };
    vsCodeApi.postMessage(message);
  }

  function onPromptTextAreaKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); // Stop the textarea from causing form submission or other default actions
      e.stopPropagation(); // Prevent the event from propagating further

      const message: EventTemplate<ArgsFromGeneratePanel> = {
        type: "generate",
        includedFiles: files.map((x) => ({
          path: x.path,
          includeOption: x.includeOption,
        })),
        model,
        prompt: (e.currentTarget as any).value,
        codegenTargets,
        codingConvention,
        fileVersion,
      };
      vsCodeApi.postMessage(message);
    }
  }

  function handleDeleteFile(filePath: string) {
    setFiles(files.filter((file) => file.path !== filePath));
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
            ref={promptRef}
            rows={10}
            cols={50}
            style={{ fontFamily: "var(--vscode-editor-font-family)" }}
            resize="both"
            onChange={(e: React.FormEvent<HTMLTextAreaElement>) =>
              setPrompt(e.currentTarget.value)
            }
            value={prompt}
          ></VSCodeTextArea>
        </CSFormField>
        <CSFormField>
          <VSCodeButton onClick={onGenerateButtonClick}>
            Generate Code
          </VSCodeButton>
        </CSFormField>
        <VSCodeDivider />
        <h3>Additional Options</h3>
        <CSFormField label={{ text: "Files to generate:" }}>
          <VSCodeDropdown
            currentValue={codegenTargets}
            style={{ width: "180px" }}
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
            currentValue={codingConvention || "None"}
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
        <CSFormField label={{ text: "Included Files:" }}>
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
              <VSCodeDropdown
                currentValue={
                  files.find((f) => f.path === file.path)?.includeOption ||
                  "source"
                }
                style={{ width: "120px", marginRight: "8px" }}
                onChange={(e: React.ChangeEvent<Dropdown>) => {
                  const filesCopy = [...files];
                  const fileIndex = filesCopy.findIndex(
                    (f) => f.path === file.path
                  );
                  if (fileIndex !== -1) {
                    filesCopy[fileIndex].includeOption = e.target
                      .value as IncludeOptions;
                  } else {
                    filesCopy.push({
                      path: file.path,
                      includeOption: e.target.value as IncludeOptions,
                      size: file.size,
                    });
                  }
                  setFiles(filesCopy);
                }}
              >
                {[
                  { text: "Full Source", value: "source" },
                  { text: "Declarations", value: "declarations" },
                ].map((item) => (
                  <VSCodeOption key={item.value} value={item.value}>
                    {item.text}
                  </VSCodeOption>
                ))}
              </VSCodeDropdown>
              <span style={{ marginRight: "1em" }}>
                {file.path} {file.size ? `(${formatFileSize(file.size)})` : ""}
              </span>
              <VSCodeLink>Add deps</VSCodeLink>
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

function getFileExtension(fileName: string) {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}
