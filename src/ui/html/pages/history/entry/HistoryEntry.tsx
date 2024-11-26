import {
  VSCodeButton,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodePanels,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { GenerateUserInput } from "../../../../panels/generate/types.js";
import {
  CommitEvent,
  GenerateCommitMessageEvent,
  RegenerateEvent,
} from "../../../../panels/historyEntry/types.js";
import { BrowserEvent, CancelEvent } from "../../../../types.js";
import { FullHistoryEntry } from "../../../../viewProviders/history/types.js";
import { CodeSnippet } from "../../../components/CodeSnippet.js";
import { CSFormField } from "../../../components/CSFormField.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { HistoryEntryPanelBrokerType } from "../../../../panels/historyEntry/getMessageBroker.js";

export type HistoryEntryPageFile = {
  filePath: string;
  original: string | undefined;
  generated: string;
  originalHtml: string | undefined;
  generatedHtml: string;
  diffHtml: string;
};

export type HistoryEntryPageArgs = {
  entry: FullHistoryEntry;
  files: HistoryEntryPageFile[];
  git: {
    files: GitFileChange[];
  };
};

export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;

  const [commitMessage, setCommitMessage] = useState<string>("");
  const [showCommitMessage, setShowCommitMessage] = useState<boolean>(false);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  const gatherArgsForRegenerateCommand = (): GenerateUserInput => {
    const { userInput } = args.entry;

    const codegenUserInput: GenerateUserInput = {
      model: userInput.model,
      prompt: args.entry.prompt,
      codingConvention: userInput.codingConvention,
      includedFiles: userInput.includedFiles,
    };

    return codegenUserInput;
  };

  const historyEntryPanelMessageClient =
    createMessageClient<HistoryEntryPanelBrokerType>((message: unknown) => {
      getVSCodeApi().postMessage(message);
    });

  const onEditClick = () => {
    const regenerateEvent: RegenerateEvent = {
      type: "regenerate",
      args: gatherArgsForRegenerateCommand(),
    };

    historyEntryPanelMessageClient.send("regenerate", regenerateEvent);

    const cancelEvent: CancelEvent = {
      type: "cancel",
    };

    historyEntryPanelMessageClient.send("cancel", cancelEvent);
  };

  const onGenerateCommitMessage = () => {
    const message: GenerateCommitMessageEvent = {
      type: "generateCommitMessage",
      prompt: args.entry.userInput.prompt,
      model: args.entry.userInput.model,
    };

    historyEntryPanelMessageClient.send("generateCommitMessage", message);
  };

  const onCommitClick = () => {
    const message: CommitEvent = {
      type: "commit",
      message: commitMessage,
    };

    historyEntryPanelMessageClient.send("commit", message);
  };

  useEffect(() => {
    const historyEntryPageMessageBroker = getMessageBroker({
      setCommitMessage,
      setShowCommitMessage,
      setIsCommitted,
    });

    function listener(event: BrowserEvent) {
      const message = event.data;
      if (historyEntryPageMessageBroker.canHandle(message.type)) {
        historyEntryPageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

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

              <h2 style={{ fontSize: "14px", marginTop: "1em" }}>
                Generated Files
              </h2>
              {args.files.length ? (
                Array.from(
                  args.files.map((file) => (
                    <CodeSnippet
                      filePath={file.filePath}
                      code={file.generatedHtml}
                      codeHtml={file.generatedHtml}
                    />
                  ))
                )
              ) : (
                <div>No files were generated.</div>
              )}
            </>
          </div>
        </VSCodePanelView>
        <VSCodePanelView>
          <div
            style={{
              fontFamily: "var(--vscode-editor-font-family)",
            }}
          >
            <h3>Prompt</h3>
            <pre>{<div>{args.entry.rawPrompt}</div>}</pre>
            <h3>Response</h3>
            <pre>{<div>{args.entry.rawResponse}</div>}</pre>
          </div>
        </VSCodePanelView>

        <VSCodePanelView>
          {args.files.length ? (
            args.files.map((file) => (
              <div key={`file-diff-${file.filePath}`}>
                <h2 style={{ fontSize: "14px", marginTop: "1em" }}>Diff</h2>
                <h3 style={{ fontSize: "14px", fontWeight: "normal" }}>
                  {file.filePath}
                </h3>
                <div
                  style={{
                    padding: "0.5em 1em 0.5em 1em",
                    borderRadius: "4px",
                  }}
                >
                  <pre>{file.diffHtml}</pre>
                </div>
              </div>
            ))
          ) : (
            <div>No files were generated.</div>
          )}
        </VSCodePanelView>

        <VSCodePanelView>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {args.git.files.length ? (
              <div>
                <div
                  style={{
                    fontFamily: "var(--vscode-editor-font-family)",
                    borderRadius: "4px",
                  }}
                >
                  <pre style={{ margin: "0px", padding: "0px" }}>
                    {args.entry.prompt}
                  </pre>
                </div>
                {!showCommitMessage && (
                  <div style={{ marginTop: "1em" }}>
                    <VSCodeButton onClick={onGenerateCommitMessage}>
                      Generate Commit Message
                    </VSCodeButton>
                  </div>
                )}
                {showCommitMessage && (
                  <div style={{ marginTop: "1em" }}>
                    <h3>Generated Commit Message</h3>
                    <div
                      style={{
                        fontFamily: "var(--vscode-editor-font-family)",
                        borderRadius: "4px",
                      }}
                    >
                      {commitMessage}
                    </div>
                    {!isCommitted ? (
                      <VSCodeButton
                        onClick={onCommitClick}
                        style={{ marginTop: "1em" }}
                      >
                        Commit Files
                      </VSCodeButton>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
                <div style={{ marginTop: "1em" }}>
                  <h3>
                    {isCommitted
                      ? "✅ The following files were committed"
                      : "Files in commit:"}
                  </h3>
                  {
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
                  }
                </div>
              </div>
            ) : (
              <div>There are no files to be committed.</div>
            )}
          </div>
        </VSCodePanelView>
      </VSCodePanels>
    </div>
  );
}
