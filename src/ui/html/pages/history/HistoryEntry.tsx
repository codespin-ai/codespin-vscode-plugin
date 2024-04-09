import {
  VSCodeButton,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodePanels,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useState } from "react";
import { getVsCodeApi } from "../../../../vscode/getVsCodeApi.js";
import { CSFormField } from "../../components/CSFormField.js";
import { HistoryEntryPageArgs } from "./HistoryEntryPageArgs.js";
import { RegeneratePageArgs } from "./RegeneratePageArgs.js";

export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;

  const [commitMessage, setCommitMessage] = useState<string>("");

  const gatherArgsForRegenerateCommand = (): RegeneratePageArgs => {
    const { userInput } = args.entry;

    const regenerateArgs: RegeneratePageArgs = {
      model: userInput.model,
      codegenTargets: userInput.codegenTargets,
      prompt: args.entry.prompt,
      codingConvention: userInput.codingConvention,
      fileVersion: userInput.fileVersion,
      includedFiles: userInput.includedFiles,
    };

    return regenerateArgs;
  };

  const onEditClick = () => {
    getVsCodeApi().postMessage({
      type: "command:codespin-ai.generate",
      args: [undefined, gatherArgsForRegenerateCommand()],
    });
    getVsCodeApi().postMessage({
      type: "cancel",
    });
  };

  return (
    <div>
      <VSCodePanels>
        <VSCodePanelTab>PROMPT</VSCodePanelTab>
        <VSCodePanelTab>RAW</VSCodePanelTab>
        <VSCodePanelTab>DIFF</VSCodePanelTab>
        <VSCodePanelTab>COMMIT</VSCodePanelTab>
        <VSCodePanelView>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <>
              <CSFormField>
                <div
                  style={{
                    padding: "1em",
                    background: "black",
                    fontFamily: "var(--vscode-editor-font-family)",
                    borderRadius: "4px",
                  }}
                >
                  <pre style={{ margin: "0px", padding: "0px" }}>
                    {args.entry.prompt}
                  </pre>
                </div>
              </CSFormField>
              <CSFormField>
                <VSCodeButton onClick={onEditClick}>Edit Prompt</VSCodeButton>
              </CSFormField>
              {Array.from(
                args.files.map((file) => (
                  <div key={`file-gen-${file.filePath}`}>
                    <h2 style={{ fontSize: "14px", marginTop: "1em" }}>
                      Generated Files
                    </h2>
                    <h3 style={{ fontSize: "14px", fontWeight: "normal" }}>
                      {file.filePath}
                    </h3>
                    <div
                      style={{
                        padding: "0.5em 1em 0.5em 1em",
                        background: "black",
                        borderRadius: "4px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: file.fileInfo.generated,
                      }}
                    />
                  </div>
                ))
              )}
            </>
          </div>
        </VSCodePanelView>
        <VSCodePanelView>
          <div
            style={{
              padding: "1em",
              background: "black",
              fontFamily: "var(--vscode-editor-font-family)",
              borderRadius: "4px",
            }}
          >
            <pre>{<div>{args.entry.rawPrompt}</div>}</pre>
          </div>
        </VSCodePanelView>
        <VSCodePanelView>
          {args.files.map((file) => (
            <div key={`file-diff-${file.filePath}`}>
              <h2 style={{ fontSize: "14px", marginTop: "1em" }}>Diff</h2>
              <h3 style={{ fontSize: "14px", fontWeight: "normal" }}>
                {file.filePath}
              </h3>
              <div
                style={{
                  padding: "0.5em 1em 0.5em 1em",
                  background: "black",
                  borderRadius: "4px",
                }}
              >
                <pre>{file.fileInfo.diffHtml}</pre>
              </div>
            </div>
          ))}
        </VSCodePanelView>
        <VSCodePanelView>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                padding: "1em",
                background: "black",
                fontFamily: "var(--vscode-editor-font-family)",
                borderRadius: "4px",
              }}
            >
              <pre style={{ margin: "0px", padding: "0px" }}>
                {args.entry.prompt}
              </pre>
            </div>
            <div style={{ marginTop: "1em" }}>
              <VSCodeButton>Generate Commit Message</VSCodeButton>
            </div>
            <div style={{ marginTop: "1em" }}>
              <h3>Files in commit:</h3>
              <ul
                style={{
                  padding: "0px",
                  margin: "0px",
                }}
              >
                {args.git.files.map((file, i) => (
                  <li key={`file-commit-${file.filePath}`}>
                    {i + 1}. {file.filePath} ({file.change})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </VSCodePanelView>
      </VSCodePanels>
    </div>
  );
}
