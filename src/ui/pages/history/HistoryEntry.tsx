import {
  VSCodeButton,
  VSCodeDivider,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useState } from "react";
import { HistoryEntryPageArgs } from "./HistoryEntryPageArgs.js";
import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";

export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;

  const [selectedFile, setSelectedFile] = useState<
    GeneratedSourceFile | undefined
  >(args.entry?.files[0]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div>
      <h1>History Entry Details</h1>

      <VSCodeDivider />
      {args.entry ? (
        <>
          <div>
            <strong>Timestamp:</strong> {formatDate(args.entry.timestamp)}
          </div>
          <div>
            <strong>User Input:</strong>
            <ul>
              <li>Type: {args.entry.userInput.type}</li>
              <li>Model: {args.entry.userInput.model}</li>
              <li>Prompt: {args.entry.userInput.prompt}</li>
              <li>Codegen Targets: {args.entry.userInput.codegenTargets}</li>
              <li>
                Coding Convention: {args.entry.userInput.codingConvention}
              </li>
              <li>File Version: {args.entry.userInput.fileVersion}</li>
              <li>
                Included Files:{" "}
                {args.entry.userInput.includedFiles
                  .map((file) => `${file.path} (${file.includeOption})`)
                  .join(", ")}
              </li>
            </ul>
          </div>
          <VSCodeDivider />
          <VSCodePanelTab>
            {args.entry.files.map((file, index) => (
              <VSCodePanelTab key={index} onClick={() => setSelectedFile(file)}>
                {file.path}
              </VSCodePanelTab>
            ))}
            {args.entry.files.map((file, index) => (
              <VSCodePanelView
                key={index}
                style={{
                  display: file.path === selectedFile?.path ? "block" : "none",
                }}
              >
                <h2>File: {file.path}</h2>
                <div>
                  <h3>Original:</h3>
                  <VSCodeTextArea rows={10} readOnly value={file.original} />
                </div>
                <div>
                  <h3>Generated:</h3>
                  <VSCodeTextArea rows={10} readOnly value={file.generated} />
                </div>
              </VSCodePanelView>
            ))}
          </VSCodePanelTab>
          <VSCodeButton onClick={() => window.history.back()}>
            Back to History
          </VSCodeButton>
        </>
      ) : (
        <div>Unable to load Entry</div>
      )}
    </div>
  );
}
