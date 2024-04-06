// Import necessary React and VSCode UI toolkit components
import {
  VSCodeButton,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodePanels,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { CSFormField } from "../../components/CSFormField.js";
import { HistoryEntryPageArgs } from "./HistoryEntryPageArgs.js";
import { RegeneratePageArgs } from "./RegeneratePageArgs.js";
import { diffContent } from "../../../../git/diffContent.js";
import { getVsCodeApi } from "../../../../vscode/getVsCodeApi.js";

// HistoryEntry component definition
export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;

  const [commitMessage, setCommitMessage] = useState<string>("");
  const [diffs, setDiffs] = useState<Array<{ path: string; diff: string }>>([]);

  // Function to format date from timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to fetch diffs asynchronously
  useEffect(() => {
    const fetchDiffs = async () => {
      if (!args.entry.files) {
        return;
      }
      const diffsPromises = args.entry.files.map(async (file) => ({
        path: file.path,
        diff: await diffContent(file.original, file.generated),
      }));
      const diffs = await Promise.all(diffsPromises);
      setDiffs(diffs);
    };

    fetchDiffs();
  }, [args.entry]);

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

  // Function to post the commit message
  const editClick = () => {
    getVsCodeApi().postMessage({
      type: "command:codespin-ai.generate",
      args: [undefined, gatherArgsForRegenerateCommand()],
    });
  };

  // Render the component
  return (
    <div>
      <VSCodePanels>
        <VSCodePanelTab>PROMPT</VSCodePanelTab>
        <VSCodePanelTab>RAW</VSCodePanelTab>
        <VSCodePanelTab>DIFF</VSCodePanelTab>
        <VSCodePanelTab>COMMIT</VSCodePanelTab>
        <VSCodePanelView>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {
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
                  <VSCodeButton onClick={editClick}>Edit Prompt</VSCodeButton>
                </CSFormField>
                {Array.from(
                  Object.keys(args.formattedFiles).map((key) => (
                    <div key={`file-gen-${key}`}>
                      <h2 style={{ fontSize: "14px", marginTop: "1em" }}>
                        Generated Files
                      </h2>
                      <h3 style={{ fontSize: "14px", fontWeight: "normal" }}>
                        {key}
                      </h3>
                      <div
                        style={{
                          padding: "0.5em 1em 0.5em 1em",
                          background: "black",
                          borderRadius: "4px",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: args.formattedFiles[key].generated,
                        }}
                      />
                    </div>
                  ))
                )}
              </>
            }
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
            <pre>
              {/* Show the raw prompt */}
              {<div>{args.entry.rawPrompt}</div>}
            </pre>
          </div>
        </VSCodePanelView>
        <VSCodePanelView>
          {/* Show diffs of all files using the diffs state */}
          {diffs.map((diff, index) => (
            <div key={index}>
              <h3>{diff.path}</h3>
              <p>{diff.diff}</p>
            </div>
          ))}
        </VSCodePanelView>
        <VSCodePanelView>
          {/* Show commit message and provide a commit action */}
          <VSCodeTextArea value={commitMessage} readOnly />
          <VSCodeButton>Commit</VSCodeButton>
        </VSCodePanelView>
      </VSCodePanels>
    </div>
  );
}
