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
import { diffContent } from "../../../git/diffContent.js";
import { getCommitMessage } from "../../../git/getCommitMessage.js";
import { FullHistoryEntry } from "../../../viewProviders/history/types.js";
import { HistoryEntryPageArgs } from "./HistoryEntryPageArgs.js";
import { CSFormField } from "../../components/CSFormField.js";

// HistoryEntry component definition
export function HistoryEntry() {
  const [entry, setEntry] = useState<FullHistoryEntry | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [diffs, setDiffs] = useState<Array<{ path: string; diff: string }>>([]);
  const [formattedFiles, setFormattedFiles] = useState<{
    [key: string]: { original: string; generated: string };
  }>({});

  // Extract the history entry from the page's state
  useEffect(() => {
    const args: HistoryEntryPageArgs = history.state;
    setEntry(args.entry);
    setFormattedFiles(args.formattedFiles || {});
  }, []);

  // Extract the history entry from the page's state
  useEffect(() => {
    const args: HistoryEntryPageArgs = history.state;
    setEntry(args.entry);
  }, []);

  // Function to format date from timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to fetch commit message asynchronously
  const fetchCommitMessage = async () => {
    if (!entry) {
      return;
    }
    const message = await getCommitMessage(entry.prompt);
    setCommitMessage(message);
  };

  // Invoke fetchCommitMessage when the entry state updates
  useEffect(() => {
    fetchCommitMessage();
  }, [entry]);

  // Function to fetch diffs asynchronously
  useEffect(() => {
    const fetchDiffs = async () => {
      if (!entry || !entry.files) {
        return;
      }
      const diffsPromises = entry.files.map(async (file) => ({
        path: file.path,
        diff: await diffContent(file.original, file.generated),
      }));
      const diffs = await Promise.all(diffsPromises);
      setDiffs(diffs);
    };

    fetchDiffs();
  }, [entry]);

  // Function to post the commit message
  const postCommit = () => {
    window.postMessage({
      type: "history:commit",
      commitMessage: commitMessage,
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
            {entry && (
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
                    {entry.prompt}
                  </div>
                </CSFormField>
                <CSFormField>
                  <VSCodeButton onClick={postCommit}>Edit Prompt</VSCodeButton>
                </CSFormField>
                {Array.from(
                  Object.keys(formattedFiles).map((key) => (
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
                          __html: formattedFiles[key].generated,
                        }}
                      />
                    </div>
                  ))
                )}
              </>
            )}
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
              {entry && <div>{entry.rawPrompt}</div>}
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
          <VSCodeButton onClick={postCommit}>Commit</VSCodeButton>
        </VSCodePanelView>
      </VSCodePanels>
    </div>
  );
}
