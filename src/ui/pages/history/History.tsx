import * as React from "react";
import { getVsCodeApi } from "../../../vscode/getVsCodeApi.js";
import { HistoryPageArgs } from "./HistoryPageArgs.js";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react/index.js";

export function History() {
  const vsCodeApi = getVsCodeApi();
  const args: HistoryPageArgs = history.state;

  // Helper function to convert timestamp to a readable format
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{ padding: "10px" }}>
      <VSCodeButton>Generate Code</VSCodeButton>
      {args.entries.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {args.entries.map((entry, index) => (
            <li
              key={index}
              style={{
                marginBottom: "20px",
                borderBottom: "1px solid #ccc",
                paddingBottom: "10px",
              }}
            >
              <div>
                <strong>Date:</strong> {formatDate(entry.timestamp)}
              </div>
              <div>
                <strong>Type:</strong> {entry.userInput.type}
              </div>
              <div>
                <strong>Model:</strong> {entry.userInput.model}
              </div>
              <div>
                <strong>Prompt:</strong> {entry.prompt}
              </div>
              <div>
                <strong>Codegen Targets:</strong>{" "}
                {entry.userInput.codegenTargets}
              </div>
              <div>
                <strong>Coding Convention:</strong>{" "}
                {entry.userInput.codingConvention}
              </div>
              <div>
                <strong>File Version:</strong> {entry.userInput.fileVersion}
              </div>
              {entry.userInput.includedFiles.length > 0 && (
                <div>
                  <strong>Included Files:</strong>
                  <ul>
                    {entry.userInput.includedFiles.map((file, fileIndex) => (
                      <li key={fileIndex}>
                        {file.path} ({file.includeOption})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div>No history entries found.</div>
      )}
    </div>
  );
}
