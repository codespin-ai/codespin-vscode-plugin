import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useState, useEffect, useRef } from "react"; // Import useRef
import { EventTemplate } from "../../EventTemplate.js";
import { ArgsFromGeneratePanel } from "../../commands/generate/ArgsFromGeneratePanel.js";
import { formatFileSize } from "../../text/formatFileSize.js";
import { getVsCodeApi } from "../../vscode/getVsCodeApi.js";
import { CSFormField } from "../components/CSFormField.js";
import { GeneratePageArgs } from "./GeneratePageArgs.js";
import { TextArea } from "@vscode/webview-ui-toolkit";

export function Generate() {
  const vsCodeApi = getVsCodeApi();
  const args: GeneratePageArgs = history.state;
  const promptRef = useRef<TextArea>(null);

  const [model, setModel] = useState(args.selectedModel);
  const [prompt, setPrompt] = useState<string>("");
  const [codegenTargets, setCodegenTargets] = useState(":prompt");
  const [codingConvention, setCodingConvention] = useState(args.conventions[0]);
  const [fileVersion, setFileVersion] = useState<"current" | "HEAD">("current");
  const [includedFiles, setIncludedFiles] = useState<
    { path: string; includeOption: "source" | "declaration" }[]
  >(
    args.files.map((file) => ({
      path: file.path,
      includeOption: "source",
    }))
  );

  useEffect(() => {
    if (includedFiles.length === 1) {
      setCodegenTargets(includedFiles[0].path);
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
  }, [includedFiles]);

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
            items={args.models.map((x) => ({
              text: x.name,
              value: x.value,
            }))}
            currentValue={model}
            style={{ width: "180px" }}
            onChange={(e: any) => setModel(e.target.value)}
          >
            {args.models.map((item) => (
              <VSCodeOption key={item.value} value={item.value}>
                {item.name}
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
          />
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
            onChange={(e: any) => setCodingConvention(e.target.value)}
            currentValue={codingConvention}
          >
            {args.conventions
              .map((x) => ({ text: x, value: x }))
              .map((item) => (
                <VSCodeOption key={item.value} value={item.value}>
                  {item.text}
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
              <span>
                {file.path} {file.size ? `(${formatFileSize(file.size)})` : ""}
              </span>
              <br />
            </div>
          ))}
        </CSFormField>
      </form>
    </div>
  );
}
