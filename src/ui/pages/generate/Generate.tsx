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
import { EventTemplate } from "../../../EventTemplate.js";
import { ArgsFromGeneratePanel } from "../../../commands/generate/ArgsFromGeneratePanel.js";
import { formatFileSize } from "../../../text/formatFileSize.js";
import { getVsCodeApi } from "../../../vscode/getVsCodeApi.js";
import { CSFormField } from "../../components/CSFormField.js";
import { GeneratePageArgs } from "./GeneratePageArgs.js";
import { Dropdown, TextArea } from "@vscode/webview-ui-toolkit";
import { ModelChange } from "../../../commands/generate/ModelChange.js";

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
  const [fileVersion, setFileVersion] = useState<"current" | "HEAD">(
    args.fileVersion || "current"
  );
  const [includedFiles, setIncludedFiles] = useState<
    { path: string; includeOption: "source" | "declaration" }[]
  >(
    args.includedFiles ||
      args.files.map((file) => ({
        path: file.path,
        includeOption: "source",
      }))
  );

  useEffect(() => {
    if (includedFiles.length === 1) {
      setCodegenTargets(includedFiles[0].path);
    }

    if (includedFiles.length >= 1) {
      const fileExtension = getFileExtension(includedFiles[0].path);
      if (includedFiles.every((x) => x.path.endsWith(fileExtension))) {
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

    const promptTextArea = promptRef.current;
    if (promptTextArea) {
      promptTextArea.focus();
      promptTextArea.addEventListener("keydown", handlePromptTextAreaKeyDown);
      return () => {
        promptTextArea.removeEventListener(
          "keydown",
          handlePromptTextAreaKeyDown
        );
      };
    }
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

  function handleModelChange(e: any) {
    setModel(e.target.value);
    const message: EventTemplate<ModelChange> = {
      type: "modelChange",
      model,
    };
    vsCodeApi.postMessage(message);
  }

  function handleGenerateClick() {
    const message: EventTemplate<ArgsFromGeneratePanel> = {
      type: "generate",
      model,
      prompt,
      codegenTargets,
      codingConvention,
      fileVersion,
      includedFiles,
    };
    vsCodeApi.postMessage(message);
  }

  function handlePromptTextAreaKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); // Stop the textarea from causing form submission or other default actions
      e.stopPropagation(); // Prevent the event from propagating further

      const message: EventTemplate<ArgsFromGeneratePanel> = {
        type: "generate",
        model,
        prompt: (e.currentTarget as any).value,
        codegenTargets,
        codingConvention,
        fileVersion,
        includedFiles,
      };
      vsCodeApi.postMessage(message);
    }
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
            onChange={handleModelChange}
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
          <VSCodeButton onClick={handleGenerateClick}>
            Generate Code
          </VSCodeButton>
        </CSFormField>
        <VSCodeDivider />
        <h3>Additional Options</h3>
        <CSFormField label={{ text: "Files to generate:" }}>
          <VSCodeDropdown
            currentValue={codegenTargets}
            style={{ width: "180px" }}
            onChange={(e: any) => setCodegenTargets(e.target.value)}
          >
            {[{ text: "As in Prompt", value: ":prompt" }]
              .concat(
                args.files.map((x) => ({
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
            onChange={(e: any) => setFileVersion(e.target.value)}
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
          {args.files.map((file) => (
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
                  includedFiles.find((f) => f.path === file.path)
                    ?.includeOption || "source"
                }
                style={{ width: "120px", marginRight: "8px" }}
                onChange={(e: any) => {
                  const newIncludedFiles = [...includedFiles];
                  const fileIndex = newIncludedFiles.findIndex(
                    (f) => f.path === file.path
                  );
                  if (fileIndex !== -1) {
                    newIncludedFiles[fileIndex].includeOption = e.target.value;
                  } else {
                    newIncludedFiles.push({
                      path: file.path,
                      includeOption: e.target.value,
                    });
                  }
                  setIncludedFiles(newIncludedFiles);
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
