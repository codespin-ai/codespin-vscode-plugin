import {
  VSCodeButton,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodePanels,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { GenerateCommandEvent } from "../../../../commands/codegen/generate.js";
import { getVsCodeApi } from "../../../../vscode/getVsCodeApi.js";
import {
  CommitEvent,
  GenerateCommitMessageEvent,
  GeneratedCommitMessageEvent,
} from "../../../panels/historyEntry/types.js";
import { CancelEvent } from "../../../types.js";
import { FullHistoryEntry } from "../../../viewProviders/history/types.js";
import { CSFormField } from "../../components/CSFormField.js";
import { GenerationUserInput } from "../../../panels/generate/types.js";

export type HistoryEntryPageFile = {
  original: string | undefined;
  generated: string;
  diffHtml: string;
};

export type HistoryEntryPageArgs = {
  entry: FullHistoryEntry;
  files: {
    filePath: string;
    fileInfo: HistoryEntryPageFile;
  }[];
  git: {
    files: GitFileChange[];
  };
};

export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;

  const [commitMessage, setCommitMessage] = useState<string>("");
  const [showCommitMessage, setShowCommitMessage] = useState<boolean>(false);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  const gatherArgsForRegenerateCommand = (): GenerationUserInput => {
    const { userInput } = args.entry;

    const regenerateArgs: GenerationUserInput = {
      model: userInput.model,
      codegenTargets: userInput.codegenTargets,
      prompt: args.entry.prompt,
      codingConvention: userInput.codingConvention,
      fileVersion: userInput.fileVersion,
      includedFiles: userInput.includedFiles,
      outputKind: userInput.outputKind,
    };

    return regenerateArgs;
  };

  const onEditClick = () => {
    const generateCommandEvent: GenerateCommandEvent = {
      type: "command:codespin-ai.generate",
      args: [undefined, gatherArgsForRegenerateCommand()],
    };
    getVsCodeApi().postMessage(generateCommandEvent);

    const cancelEvent: CancelEvent = {
      type: "cancel",
    };
    getVsCodeApi().postMessage(cancelEvent);
  };

  const onGenerateCommitMessage = () => {
    const message: GenerateCommitMessageEvent = {
      type: "generateCommitMessage",
      prompt: args.entry.userInput.prompt,
      model: args.entry.userInput.model,
    };
    getVsCodeApi().postMessage(message);
  };

  const onCommitClick = () => {
    const message: CommitEvent = {
      type: "commit",
      message: commitMessage,
    };
    getVsCodeApi().postMessage(message);
  };

  useEffect(() => {
    const messageListener = (event: any) => {
      if (event.data.type === "generatedCommitMessage") {
        const incomingMessage: GeneratedCommitMessageEvent = event.data;
        setCommitMessage(incomingMessage.message);
        setShowCommitMessage(true);
      } else if (event.data.type === "committed") {
        setIsCommitted(true);
      }
    };

    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
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
            {args.git.files.length ? (
              <div>
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
                        padding: "1em",
                        background: "black",
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
              <div
                style={{
                  paddingTop: "1em",
                }}
              >
                There are no files to be committed.
              </div>
            )}
          </div>
        </VSCodePanelView>
      </VSCodePanels>
    </div>
  );
}
